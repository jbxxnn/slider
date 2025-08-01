import { findAutomation } from '@/actions/automations/queries'
import {
  createChatHistory,
  getChatHistory,
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
  trackResponses,
} from '@/actions/webhook/queries'
import { sendDM, sendPrivateMessage } from '@/lib/fetch'
import { openai } from '@/lib/openai'
import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('🔍 Webhook verification request received')
  const hub = req.nextUrl.searchParams.get('hub.challenge')
  console.log('🔍 Hub challenge:', hub)
  return new NextResponse(hub)
}

export async function POST(req: NextRequest) {
  console.log('🔍 Webhook POST request received')
  
  try {
    const webhook_payload = await req.json()
    console.log('🔍 Full webhook payload:', JSON.stringify(webhook_payload, null, 2))
    
    let matcher
    console.log('🔍 Processing webhook entry:', webhook_payload.entry?.[0])
    
    // Check for messaging (DMs)
    if (webhook_payload.entry?.[0]?.messaging) {
      console.log('🔍 DM detected:', webhook_payload.entry[0].messaging[0])
      const messageText = webhook_payload.entry[0].messaging[0].message?.text
      console.log('🔍 DM text:', messageText)
      
      if (messageText) {
        matcher = await matchKeyword(messageText)
        console.log('🔍 DM keyword match result:', matcher)
      }
    }

    // Check for changes (comments)
    if (webhook_payload.entry?.[0]?.changes) {
      console.log('🔍 Changes detected:', webhook_payload.entry[0].changes[0])
      const changeField = webhook_payload.entry[0].changes[0].field
      console.log('🔍 Change field:', changeField)
      
      if (changeField === 'comments') {
        const commentText = webhook_payload.entry[0].changes[0].value?.text
        console.log('🔍 Comment text:', commentText)
        
        if (commentText) {
          matcher = await matchKeyword(commentText)
          console.log('🔍 Comment keyword match result:', matcher)
        }
      }
    }

    console.log('🔍 Final matcher result:', matcher)

    if (matcher && matcher.automationId) {
      console.log('✅ Keyword matched! Automation ID:', matcher.automationId)

      // Handle DMs
      if (webhook_payload.entry[0].messaging) {
        console.log('🔍 Processing DM automation')
        const automation = await getKeywordAutomation(matcher.automationId, true)
        console.log('🔍 DM automation found:', automation?.id)

        if (automation && automation.trigger) {
          console.log('🔍 Automation trigger:', automation.trigger)
          console.log('🔍 Automation listener:', automation.listener)

          if (automation.listener && automation.listener.listener === 'MESSAGE') {
            console.log('🔍 Sending MESSAGE type response')
            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              automation.listener?.prompt,
              automation.User?.integrations[0].token!
            )

            console.log('🔍 DM send result:', direct_message.status, direct_message.data)

            if (direct_message.status === 200) {
              const tracked = await trackResponses(automation.id, 'DM')
              console.log('🔍 Response tracked:', tracked)
              if (tracked) {
                return NextResponse.json(
                  {
                    message: 'Message sent',
                  },
                  { status: 200 }
                )
              }
            }
          }

          if (
            automation.listener &&
            automation.listener.listener === 'SMARTAI' &&
            automation.User?.subscription?.plan === 'PRO'
          ) {
            console.log('🔍 Sending SMARTAI response')
            const smart_ai_message = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'assistant',
                  content: `${automation.listener?.prompt}: Keep responses under 2 sentences`,
                },
              ],
            })

            console.log('🔍 AI response:', smart_ai_message.choices[0].message.content)

            if (smart_ai_message.choices[0].message.content) {
              const reciever = createChatHistory(
                automation.id,
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                webhook_payload.entry[0].messaging[0].message.text
              )

              const sender = createChatHistory(
                automation.id,
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                smart_ai_message.choices[0].message.content
              )

              await client.$transaction([reciever, sender])
              console.log('🔍 Chat history saved')

              const direct_message = await sendDM(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                smart_ai_message.choices[0].message.content,
                automation.User?.integrations[0].token!
              )

              console.log('🔍 AI DM send result:', direct_message.status)

              if (direct_message.status === 200) {
                const tracked = await trackResponses(automation.id, 'DM')
                console.log('🔍 AI response tracked:', tracked)
                if (tracked) {
                  return NextResponse.json(
                    {
                      message: 'Message sent',
                    },
                    { status: 200 }
                  )
                }
              }
            }
          }
        }
      }

      // Handle Comments
      if (
        webhook_payload.entry[0].changes &&
        webhook_payload.entry[0].changes[0].field === 'comments'
      ) {
        console.log('🔍 Processing comment automation')
        const automation = await getKeywordAutomation(matcher.automationId, false)
        console.log('🔍 Comment automation found:', automation?.id)

        const automations_post = await getKeywordPost(
          webhook_payload.entry[0].changes[0].value.media.id,
          automation?.id!
        )

        console.log('🔍 Automation post check:', automations_post)

        if (automation && automations_post && automation.trigger) {
          console.log('🔍 Comment automation conditions met')
          if (automation.listener) {
            console.log('🔍 Comment listener type:', automation.listener.listener)
            
            if (automation.listener.listener === 'MESSAGE') {
              console.log('🔍 Sending comment MESSAGE response')
              console.log('🔍 Comment details:', {
                postId: webhook_payload.entry[0].id,
                commentId: webhook_payload.entry[0].changes[0].value.id,
                fromId: webhook_payload.entry[0].changes[0].value.from.id,
                text: webhook_payload.entry[0].changes[0].value.text
              })

              const direct_message = await sendPrivateMessage(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].changes[0].value.id,
                automation.listener?.prompt,
                automation.User?.integrations[0].token!
              )

              console.log('🔍 Comment response result:', direct_message.status, direct_message.data)
              
              if (direct_message.status === 200) {
                const tracked = await trackResponses(automation.id, 'COMMENT')
                console.log('🔍 Comment response tracked:', tracked)

                if (tracked) {
                  return NextResponse.json(
                    {
                      message: 'Message sent',
                    },
                    { status: 200 }
                  )
                }
              }
            }
            
            if (
              automation.listener.listener === 'SMARTAI' &&
              automation.User?.subscription?.plan === 'PRO'
            ) {
              console.log('🔍 Sending comment SMARTAI response')
              const smart_ai_message = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'assistant',
                    content: `${automation.listener?.prompt}: keep responses under 2 sentences`,
                  },
                ],
              })
              
              console.log('🔍 Comment AI response:', smart_ai_message.choices[0].message.content)
              
              if (smart_ai_message.choices[0].message.content) {
                const reciever = createChatHistory(
                  automation.id,
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.from.id,
                  webhook_payload.entry[0].changes[0].value.text
                )

                const sender = createChatHistory(
                  automation.id,
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.from.id,
                  smart_ai_message.choices[0].message.content
                )

                await client.$transaction([reciever, sender])
                console.log('🔍 Comment chat history saved')

                const direct_message = await sendPrivateMessage(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.id,
                  smart_ai_message.choices[0].message.content,
                  automation.User?.integrations[0].token!
                )

                console.log('🔍 Comment AI response result:', direct_message.status)

                if (direct_message.status === 200) {
                  const tracked = await trackResponses(automation.id, 'COMMENT')
                  console.log('🔍 Comment AI response tracked:', tracked)

                  if (tracked) {
                    return NextResponse.json(
                      {
                        message: 'Message sent',
                      },
                      { status: 200 }
                    )
                  }
                }
              }
            }
          }
        } else {
          console.log('❌ Comment automation conditions not met:', {
            hasAutomation: !!automation,
            hasPost: !!automations_post,
            hasTrigger: !!automation?.trigger
          })
        }
      }
    }

    if (!matcher) {
      console.log('🔍 No keyword match found, checking chat history')
      
      if (webhook_payload.entry[0].messaging) {
        const customer_history = await getChatHistory(
          webhook_payload.entry[0].messaging[0].recipient.id,
          webhook_payload.entry[0].messaging[0].sender.id
        )

        console.log('🔍 Chat history found:', customer_history.history.length, 'messages')

        if (customer_history.history.length > 0) {
          const automation = await findAutomation(customer_history.automationId!)

          console.log('🔍 History automation:', {
            id: automation?.id,
            plan: automation?.User?.subscription?.plan,
            listener: automation?.listener?.listener
          })

          if (
            automation?.User?.subscription?.plan === 'PRO' &&
            automation.listener?.listener === 'SMARTAI'
          ) {
            console.log('🔍 Processing history-based AI response')
            const smart_ai_message = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'assistant',
                  content: `${automation.listener?.prompt}: keep responses under 2 sentences`,
                },
                ...customer_history.history,
                {
                  role: 'user',
                  content: webhook_payload.entry[0].messaging[0].message.text,
                },
              ],
            })

            console.log('🔍 History AI response:', smart_ai_message.choices[0].message.content)

            if (smart_ai_message.choices[0].message.content) {
              const reciever = createChatHistory(
                automation.id,
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                webhook_payload.entry[0].messaging[0].message.text
              )

              const sender = createChatHistory(
                automation.id,
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                smart_ai_message.choices[0].message.content
              )
              await client.$transaction([reciever, sender])
              console.log('🔍 History chat saved')

              const direct_message = await sendDM(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                smart_ai_message.choices[0].message.content,
                automation.User?.integrations[0].token!
              )

              console.log('🔍 History DM result:', direct_message.status)

              if (direct_message.status === 200) {
                return NextResponse.json(
                  {
                    message: 'Message sent',
                  },
                  { status: 200 }
                )
              }
            }
          }
        }
      }

      console.log('❌ No automation found for this message')
      return NextResponse.json(
        {
          message: 'No automation set',
        },
        { status: 200 }
      )
    }
    
    console.log('✅ Webhook processed successfully')
    return NextResponse.json(
      {
        message: 'No automation set',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      {
        message: 'No automation set',
      },
      { status: 200 }
    )
  }
}
