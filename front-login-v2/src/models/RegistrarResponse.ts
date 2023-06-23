type RegistrarResponse = {
  message?: string
  subject?: string
}

type CargarImagenResponse = {
  "image_id": string
  subject: string
}

type ImgPorUsuarioResponse = {
  faces: [
    {
      "image_id": string
      subject: string
    }
  ],
  "total_pages": number
  "total_elements": number
  "page_size": number
  "page_number": number
}

type ComparacionResponse = {
  message?: string
  result?: [
    {
      source_image_face: {
        box: {
          probability: number
          "x_max": number
          "y_max": number
          "x_min": number
          "y_min": number
        }
      },
      face_matches: [
        {
          box: {
            probability: number
            "x_max": number
            "y_max": number
            "x_min": number
            "y_min": number
          },
          similarity: number
        }
      ]
    }
  ]
}

export type { RegistrarResponse, CargarImagenResponse, ImgPorUsuarioResponse, ComparacionResponse }