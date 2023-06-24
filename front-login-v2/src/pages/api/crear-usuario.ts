import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { commonHeaders, requestConfig } from '@/config/axios'
import { CargarImagenResponse, RegistrarResponse } from '@/models/RegistrarResponse'
import { OcrResponse } from '@/models/OcrResponse'

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } }

// Crear usuario al encontrar coincidencia con la cedula
const crearUsuario = async (nroCi: string) => {
  const url = process.env.RECOGNITION_API! + 'subjects'
  const parametros = {
    "subject": nroCi
  }
  console.log('Inicio de peticion crearUsuario');
  const response = await axios.post<RegistrarResponse>(url, parametros, {
    headers: {
      ...commonHeaders
    },
    ...requestConfig,
  })

  if (response.status === 201) {
    return 'OK'
  } else {
    return response.data.message
  }
}

//Añade una imagen de ej para el usario designado
const agregarImagenUsuario = async (nroCi: string, ciFrontal: string) => {
  const url = process.env.RECOGNITION_API! + 'faces?subject=' + nroCi
  const parametros = {
    "file": ciFrontal
  }
  console.log('Inicio de peticion agregarImagenUsuario');
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { docFrontal, docTrasero, ci } = req.body
  const url = process.env.OCR_API!;
  const params1 = {
    base64Image: docFrontal,
  };

  const params2 = {
    base64Image: docTrasero,
  };

  console.log('Inicio de peticion ocr');
  try {
    const response1 = await axios.post<OcrResponse>(url, params1, { ...requestConfig, })

    if (response1.status === 200) {
      if (response1.data.text.includes(ci)) {
        const crearResponse = await crearUsuario(ci)
        if (crearResponse === 'OK') {
          await agregarImagenUsuario(ci, docFrontal)
          return res.status(200).json({ message: crearResponse })
        }
        return res.status(400).json({ message: crearResponse })
      }
    }

    if (response1.status === 400) {
      console.log(response1.data.error)
      res.status(response1.status).json(response1.data.error)
      return
    }

    console.log('Inicio de peticion ocr');
    const response2 = await axios.post<OcrResponse>(url, params2, { ...requestConfig, })
    if (response2.status === 200) {
      if (response2.data.text.includes(ci)) {
        const crearResponse = await crearUsuario(ci)
        if (crearResponse === 'OK') {
          await agregarImagenUsuario(ci, docFrontal)
          return res.status(200).json({ message: crearResponse })
        }
        return res.status(400).json({ message: crearResponse })
      }
    }

    if (response2.status === 400) {
      console.log(response2.data.error)
      res.status(response2.status).json(response2.data.error)
      return
    }

    res.status(404).json({ message: 'No se encontraron coincidencias en el documento.' })
  } catch (error) {
    res.status(500).json({ message: 'Ocurrio un error en el servidor: ' + error })
  }
}
