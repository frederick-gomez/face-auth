import { useState } from 'react';
import { useRouter } from 'next/router';
import Documento from '@/components/Registro/Documento';
import Facial from '@/components/Registro/Facial';
import mensajes from '@/utils/mensajes.json';
import * as faceapi from 'face-api.js';
import { TypeApiResponse } from '@/models/ApiResponse';

interface Props extends TypeApiResponse {
	expresion: keyof faceapi.FaceExpressions;
}

CrearUsuario.getInitialProps = async () => {
	const randIndex = Math.floor(Math.random() * mensajes.expresiones.length);
	const VALIDACION_INICIAL = mensajes.expresiones[randIndex];

	return {
		estado: 'Inicial',
		message: VALIDACION_INICIAL.mensaje,
		expresion: VALIDACION_INICIAL.expresion,
	};
};

function CrearUsuario(props: Props) {
	const router = useRouter();
	const CI = router.query.ci as string;
	const [registroDocumento, setRegistroDocumento] = useState(true);

	const continuarRegistro = () => setRegistroDocumento(false);

	return registroDocumento ? (
		<Documento continuarRegistro={continuarRegistro} />
	) : (
		<Facial ci={CI} volver={() => setRegistroDocumento(true)} {...props} />
	);
}

export default CrearUsuario;
