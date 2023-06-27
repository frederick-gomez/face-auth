import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { base64ToImage } from '@/utils/ConverFile';
import { RegistrarResponse } from '@/models/RegistrarResponse';
import { useRouter } from 'next/router';
import mensajes from '@/utils/mensajes.json';
import { TypeApiResponse } from '@/models/ApiResponse';

interface Props extends TypeApiResponse {
	expresion: keyof faceapi.FaceExpressions;
}

Ingresar.getInitialProps = async () => {
	const randIndex = Math.floor(Math.random() * mensajes.expresiones.length);
	const VALIDACION_INICIAL = mensajes.expresiones[randIndex];

	return {
		estado: 'Inicial',
		message: VALIDACION_INICIAL.mensaje,
		expresion: VALIDACION_INICIAL.expresion,
	};
};

function Ingresar({ estado, message, expresion }: Props) {
	const router = useRouter();
	const CI = router.query.ci as string;
	const webcamRef = useRef<Webcam>(null);
	const [capturedImage, setCapturedImage] = useState('');
	const [apiResponse, setApiResponse] = useState<TypeApiResponse>({ estado, message });
	const [usuarioIdentificado, setUsuarioIdentificado] = useState(false);

	const loadModels = async () => {
		const MODEL_URI = '/models';
		await Promise.all([
			faceapi.nets.tinyFaceDetector.load(MODEL_URI),
			faceapi.nets.faceLandmark68Net.load(MODEL_URI),
			faceapi.nets.faceRecognitionNet.load(MODEL_URI),
			faceapi.nets.faceExpressionNet.load(MODEL_URI),
		]);
	};

	useEffect(() => {
		const load = async () => {
			await loadModels();
		};
		load();
	}, []);

	useEffect(() => {
		const capture = async () => {
			const imageSrc = webcamRef.current?.getScreenshot();

			if (imageSrc && imageSrc?.length > 0) {
				setCapturedImage(imageSrc.split(',')[1]);

				const detections = await faceapi
					.detectSingleFace(base64ToImage(imageSrc), new faceapi.TinyFaceDetectorOptions())
					.withFaceExpressions();

				if (detections) {
					const { expressions } = detections;
					if ((expressions[`${expresion}`] as number) > 0.5) {
						if (apiResponse.estado !== 'Cargando') {
							await reconocimientoFacial();
						}
					}
				}
			}
		};

		const reconocimientoFacial = async () => {
			setApiResponse({ estado: 'Cargando', message: 'Aguarde un momento...' });
			const url = '/api/login';
			const parametros = {
				ci: CI,
				captura: capturedImage,
			};

			try {
				const response = await axios.post<RegistrarResponse>(url, parametros, {
					validateStatus: () => true,
				});
				if (response.data.message === 'OK') {
					setApiResponse({ estado: 'OK', message: response.data.message });
					parent.postMessage('OK', '*');
					setUsuarioIdentificado(true);
				} else {
					setApiResponse({ estado: 'Inicial', message: response.data.message! });
				}
			} catch (error) {
				setApiResponse({ estado: 'Error', message: 'Ocurrió un error.' });
				console.log('Error:' + error);
			}
		};

		const interval = setInterval(async () => {
			if (!usuarioIdentificado) {
				await capture();
			}
		}, 2500);

		return () => clearInterval(interval);
	}, [capturedImage, usuarioIdentificado, CI, apiResponse.estado, expresion]);

	let divResultado: React.ReactNode;

	switch (apiResponse.estado) {
		case 'Error':
			divResultado = (
				<div className='mt-3 flex items-center justify-center rounded bg-red-200 p-2 sm:p-4'>
					<p className='font-semibold text-red-600'>{apiResponse.message}</p>
				</div>
			);
			break;
		case 'OK':
			divResultado = (
				<div className='mt-3 flex items-center justify-center rounded bg-green-200 p-2 sm:p-4'>
					<p className='font-semibold text-green-600'>{apiResponse.message}</p>
				</div>
			);
			break;
		case 'Inicial':
			divResultado = (
				<div className='mt-3 flex items-center justify-center rounded bg-blue-200 p-2 sm:p-4'>
					<p className='font-semibold text-blue-600'>{apiResponse.message}</p>
				</div>
			);
			break;
		case 'Cargando':
			divResultado = (
				<div className='mt-3 flex items-center justify-center rounded bg-yellow-200 p-2 sm:p-4'>
					<p className='font-semibold text-yellow-600'>{apiResponse.message}</p>
				</div>
			);
			break;
	}

	return (
		<div className='container mx-auto max-w-[700px] p-4 '>
			<div className='mb-4'>
				<div className='flex min-h-[250px] items-center overflow-hidden rounded border-[1px] border-neutral-500 bg-black shadow-lg'>
					<Webcam
						audio={false}
						ref={webcamRef}
						screenshotFormat='image/jpeg'
						width='100%'
						height='100%'
						mirrored={true}
						videoConstraints={{ facingMode: 'user' }}
					/>
				</div>
				{apiResponse && divResultado}
				<div className='mt-3 text-sm'>
					{mensajes.recomendaciones.map((mensaje) => (
						<p key={mensaje}>- {mensaje}</p>
					))}
				</div>
			</div>
		</div>
	);
}

export default Ingresar;
