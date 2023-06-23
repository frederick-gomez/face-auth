
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { commonHeaders, requestConfig } from '@/config/axios'
import { arrayBufferToBase64 } from '@/utils/ConverFile';
import { CargarImagenResponse, ComparacionResponse, ImgPorUsuarioResponse } from '@/models/RegistrarResponse';

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } }

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    ci: string
    captura: string
  };
}

const agregarImagenUsuario = async (nroCi: string, imagen: string) => {
  const url = process.env.RECOGNITION_API! + 'faces?subject=' + nroCi
  const parametros = {
    "file": imagen
  }

  const response = await axios.post<CargarImagenResponse>(url, parametros, {
    headers: {
      ...commonHeaders
    },
    ...requestConfig,
  })

  if (response.status === 201) {
    return 'OK'
  } else {
    return response.data
  }
}

const getImageById = async (imageId: string) => {
  const params = `faces/${imageId}/img`
  const url = process.env.RECOGNITION_API + params;

  const response = await axios.get<ArrayBuffer>(url, {
    headers: {
      "x-api-key": process.env.RECOGNITION_APIKEY!
    },
    responseType: 'arraybuffer',
    ...requestConfig,
  })
  return arrayBufferToBase64(response.data)
}

const compararImagenes = async (imagen1: string, imagen2: string) => {
  const url = process.env.VERIFICATION_API + 'verify';
  const parametros = {
    "source_image": imagen1,
    "target_image": imagen2
  }
  const response = await axios.post<ComparacionResponse>(url, parametros, {
    headers: {
      "x-api-key": process.env.VERIFICATION_APIKEY!
    },
    ...requestConfig,
  })
  if (response.data.result) {
    return response.data.result[0].face_matches[0].similarity
  } else {
    return response.data.message
  }
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  const { ci, captura } = req.body
  const params = `faces?subject=${ci}`
  const url = process.env.RECOGNITION_API + params;

  try {
    const response = await axios.get<ImgPorUsuarioResponse>(url, {
      headers: {
        ...commonHeaders,
      },
      ...requestConfig,
    })

    if (response.status === 200 && response.data.total_elements > 0) {
      const imagen = await getImageById(response.data.faces[0].image_id)
      const comparativa = await compararImagenes(imagen, captura)

      if (typeof comparativa === 'number' && comparativa < parseFloat(process.env.NIVEL_REC!)) {
        return res.status(200).json({ message: 'Menor a expectativa: ' + comparativa })
      }
      await agregarImagenUsuario(ci, captura)
      return res.status(200).json({ message: 'OK' })
    }
    console.log(response.data)
    res.status(response.status).json({ message: 'No se encontraron imagenes para este usuario.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Ocurrio un error.' })
  }
}
