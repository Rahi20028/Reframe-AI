import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { pipeline } from '@xenova/transformers'
import { conversationExamples } from '../src/data/conversation-examples'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('Loading embedding model (first run downloads ~90MB)...')
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

  for (const example of conversationExamples) {
    const output = await embedder(example.studentMessage, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data) as number[]

    const { error } = await supabase
      .from('conversation_examples')
      .insert({
        student_message: example.studentMessage,
        ideal_response: example.idealResponse,
        category: example.category,
        embedding,
      })

    if (error) {
      if (error.code === '23505') {
        console.log(`Skipped (already exists): "${example.studentMessage.slice(0, 50)}..."`)
      } else {
        console.error(`Failed to insert: "${example.studentMessage}"`, error)
      }
    } else {
      console.log(`Inserted: "${example.studentMessage.slice(0, 50)}..."`)
    }
  }

  console.log('Done seeding!')
}

seed()