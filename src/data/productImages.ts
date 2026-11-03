
const productImages: Record<string, string> = {
  'Arroz 5 kg': 'ARROZ 5KG.jpeg',
  'Feijão 1 kg': 'FEIJAO 1KG.jpeg',
  'Óleo de Soja 900 ml': 'Óleo de Soja 900 ml.jpeg',
  'Açúcar 1 kg': 'Açúcar 1 kg.jpeg',
  'Café 500 g': 'Café 500 g.jpeg',
  'Macarrão 500 g': 'Macarrão 500 g.jpeg',
  'Leite Integral 1 L': 'Leite Integral 1 L.jpeg',
}

export function getProductImage(
  productName: string,
): string | null {
  const name = productName.trim()
  const imageFile = productImages[name]

  if (!imageFile) {
    return null
  }

  return `${import.meta.env.BASE_URL}imagem/${encodeURIComponent(imageFile)}`
}
