const Anthropic = require('@anthropic-ai/sdk')
const pool = require('../config/db')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// MOCK PARSER — used as fallback
const mockParseExpense = (rawInput) => {
  const input = rawInput.toLowerCase()
  const amountMatch = input.match(/\d+/)
  const amount = amountMatch ? parseFloat(amountMatch[0]) : null
  const item = rawInput.replace(/\d+/g, '').trim()

  let category = 'Other'
  if (input.match(/onion|tomato|potato|sabzi|vegetable|zepto|blinkit|milk|rice|dal|atta|grocery/)) {
    category = 'Grocery'
  } else if (input.match(/restaurant|food|lunch|dinner|breakfast|chai|coffee|dhaba|swiggy|zomato/)) {
    category = 'Food'
  } else if (input.match(/auto|cab|uber|ola|bus|metro|petrol|fuel|travel|ticket/)) {
    category = 'Travel'
  } else if (input.match(/rent|room|flat|house|pg/)) {
    category = 'Rent'
  } else if (input.match(/amazon|flipkart|shop|clothes|shirt|shoes|mall/)) {
    category = 'Shopping'
  } else if (input.match(/movie|netflix|spotify|game|entertainment|concert/)) {
    category = 'Entertainment'
  } else if (input.match(/medicine|doctor|hospital|pharmacy|health|gym/)) {
    category = 'Health'
  }

  return {
    item: item || rawInput,
    amount,
    category,
    confidence: amount ? 'high' : 'low',
    suggested_new_category: null,
    source: 'mock'
  }
}

const mockGenerateSummary = (expenseData) => {
  const { totalAmount, categories } = expenseData

  if (!categories || categories.length === 0) {
    return 'No expenses recorded this month yet. Start adding your expenses!'
  }

  const biggest = categories.reduce((max, cat) =>
    cat.amount > max.amount ? cat : max, categories[0]
  )

  const percentage = Math.round((biggest.amount / totalAmount) * 100)

  return `Your biggest expense this month was ${biggest.category} at ₹${biggest.amount}, which accounts for ${percentage}% of your total spending of ₹${totalAmount}. You have logged expenses across ${categories.length} categories this month. Consider reviewing your ${biggest.category} expenses to see if there are areas where you can save.`
}

// REAL CLAUDE PARSER
const realParseExpense = async (rawInput, categories) => {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `You are an expense categorizer for an Indian user. Parse this expense input and return ONLY a valid JSON object, no explanation.

Input: "${rawInput}"
Available categories: ${categories.join(', ')}

Return exactly this format:
{
  "item": "item name cleaned up",
  "amount": 50,
  "category": "Grocery",
  "confidence": "high",
  "suggested_new_category": null
}

Rules:
- Extract item name and amount (number only)
- Match to closest category from the list
- If no category fits well, set confidence to "low" and suggest a new category name
- Handle Hinglish input naturally
- Return ONLY the JSON, nothing else`
      }
    ]
  })

  const text = message.content[0].text.trim()
  const parsed = JSON.parse(text)
  return { ...parsed, source: 'claude' }
}

// MAIN EXPORTED FUNCTION
const parseExpense = async (rawInput, categories = []) => {
  // Try real Claude first — fall back to mock if it fails
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('🤖 Using Claude AI...')
      const result = await realParseExpense(rawInput, categories)
      console.log('✅ Claude parsed:', result)
      return result
    } catch (err) {
      console.log('⚠️ Claude failed, using mock:', err.message)
      return mockParseExpense(rawInput)
    }
  }

  console.log('🔧 Using mock parser...')
  return mockParseExpense(rawInput)
}

// MONTHLY SUMMARY GENERATOR
const generateMonthlySummary = async (expenseData) => {
  // If no API key or no credits, use mock summary
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockGenerateSummary(expenseData)
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are a friendly personal finance assistant for an Indian user. 
          Based on this month's expense data, write a 3-4 sentence plain English summary.
          
          Data: ${JSON.stringify(expenseData)}
          
          Mention: biggest category, any notable pattern, one practical suggestion.
          Keep it friendly and conversational. Use ₹ symbol for amounts.`
        }
      ]
    })
    return message.content[0].text
  } catch (err) {
    // If API fails (no credits etc) → fall back to mock
    console.log('⚠️ Summary generation failed, using mock:', err.message)
    return mockGenerateSummary(expenseData)
  }
}

module.exports = { parseExpense, generateMonthlySummary }