import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { commonHeaders, requestConfig } from '@/config/axios'
import { CargarImagenResponse, ComparacionResponse, ImgPorUsuarioResponse } from '@/models/RegistrarResponse';
import { arrayBufferToBase64 } from '@/utils/ConverFile';
import { verifyToken } from '@/utils/Token';

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    ci: string
    captura: string
  };
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

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  let { ci, captura } = req.body

  try {
    const isVerified = verifyToken(ci)
    ci = isVerified.ci
  } catch (err) {
    return res.status(401).json(err)
  }

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
      let resultado;
      for (let i = 0; i < response.data.total_elements; i++) {
        if (i === 3) { break } //Comparar hasta 3 imagenes
        const imagen = await getImageById(response.data.faces[i].image_id)
        resultado = await compararImagenes(imagen, captura)

        if (typeof resultado === 'number' && resultado >= parseFloat(process.env.NIVEL_REC!)) {
          if (response.data.total_elements === 2) {
            await agregarImagenUsuario(ci, captura)
          }
          return res.status(200).json({ message: 'OK' })
        }
      }
      return res.status(200).json({ message: 'Menor a expectativa: ' + resultado })
    }
    res.status(response.status).json({ message: 'No se encontraron imagenes para este usuario.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Ocurrio un error.' })
  }
}
