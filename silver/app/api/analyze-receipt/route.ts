import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no soportado' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: file.type, data: base64 },
            },
            {
              type: 'text',
              text: 'Analiza esta factura o recibo. Extrae la siguiente información y responde ÚNICAMENTE con un JSON válido, sin texto extra:\n{"amount": <número decimal>, "vendor": "<nombre del comercio>", "date": "<YYYY-MM-DD>", "category": "<una de: Comida, Transporte, Entretenimiento, Servicios, Salud, Tecnología, Ropa, Hogar, Educación, Otro>", "description": "<descripción breve de 1 línea>"}\nSi no puedes determinar un campo con certeza, usa null.',
            },
          ],
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    return NextResponse.json({ error: 'Error al analizar la imagen' }, { status: 500 })
  }

  const result = await anthropicRes.json()
  const text: string = result.content?.[0]?.text ?? ''

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no json')
    const parsed = JSON.parse(match[0])
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'No se pudo extraer la información de la imagen' }, { status: 422 })
  }
}
