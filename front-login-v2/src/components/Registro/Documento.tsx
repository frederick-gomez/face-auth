import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import AddFileSvg from '@/ui/icons/AddFileSvg';
import DocumentSvg from '@/ui/icons/DocumentSvg';
import LoadingIcon from '@/ui/icons/LoadingIcon';
import { fileToBase64 } from '@/utils/ConverFile';
import CameraIcon from '@/ui/icons/CameraIcon';
import AddDocIcon from '@/ui/icons/AddDocIcon';
import CheckIcon from '@/ui/icons/CheckIcon';
import CamaraDoc from './CamaraDoc';

type CrearUsuarioResponse = {
	message: 'OK' | string;
};

type Props = {
	continuarRegistro: () => void;
};

const Documento = ({ continuarRegistro }: Props) => {
	const router = useRouter();
	const CI = router.query.ci;
	const [isLoading, setIsLoading] = useState(false);
	const [aviso, setAviso] = useState('');
	const [docFrontal, setDocFrontal] = useState('');
	const [docTrasero, setDocTrasero] = useState('');
	const [abrirCamara, setAbrirCamara] = useState(false);

	const submitDocumentos = async () => {
		setAviso('');
		if (!docFrontal || !docTrasero) {
			setAviso('Debes subir ambos lados del documento');
			return;
		}

		setIsLoading(!isLoading);
		const url = '/api/crear-usuario';
		const parametros = {
			docFrontal,
			docTrasero,
			ci: CI,
		};

		try {
			const response = await axios.post<CrearUsuarioResponse>(url, parametros, {
				validateStatus: () => true,
			});

			if (response.status === 200) {
				continuarRegistro();
			} else {
				setAviso(response.data.message);
			}
		} catch (err) {
			setAviso('Ocurrio un error');
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDoc1 = async (e: ChangeEvent<HTMLInputElement>) => {
		setAviso('');
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			const stringImage = (await fileToBase64(file)) as string;
			setDocFrontal(stringImage.split(',')[1]);

			e.target.files = null;
		}
	};

	const handleDoc2 = async (e: ChangeEvent<HTMLInputElement>) => {
		setAviso('');
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			const stringImage = (await fileToBase64(file)) as string;
			setDocTrasero(stringImage.split(',')[1]);

			e.target.files = null;
		}
	};

	return (
		<div className='container mx-auto flex h-screen flex-col items-center justify-center p-4'>
			<div className='mb-6 max-w-[60%] md:mb-10 md:flex md:items-center md:justify-center'>
				<div className='md:mr-5'>
					<DocumentSvg className='mx-auto h-24' />
				</div>
				<div className='text-center md:text-left'>
					<h1 className='max-w-md text-xl font-bold md:text-2xl'>Saca una foto a tu Cedula</h1>
					<p className=''>Asegurate de tener buena iluminación y que los datos sean visibles</p>
				</div>
			</div>
			<ul className='mb-5 flex min-w-[340px] divide-x divide-gray-700 rounded-lg text-center text-sm font-medium text-gray-400 shadow'>
				<li className='w-full'>
					<button
						onClick={() => setAbrirCamara(false)}
						className={`flex h-full w-full items-center justify-center rounded-l-lg px-3 py-2 text-white transition-all hover:bg-opacity-90 active:bg-blue-700 active:text-white ${
							!abrirCamara ? 'bg-blue-700' : 'bg-gray-700'
						}`}
					>
						<AddDocIcon className='h-6 pr-2' /> Subir Localmente
					</button>
				</li>
				<li className='w-full'>
					<button
						onClick={() => setAbrirCamara(true)}
						className={`flex h-full w-full items-center justify-center rounded-r-lg px-3 py-2 text-white transition-all hover:bg-opacity-90 active:bg-blue-700 active:text-white ${
							abrirCamara ? 'bg-blue-700' : 'bg-gray-700'
						}`}
					>
						<CameraIcon className='h-6 pr-2' /> Abrir Cámara
					</button>
				</li>
			</ul>
			{abrirCamara ? (
				<CamaraDoc
					setDocFrontal={(img: string) => setDocFrontal(img)}
					setDocTrasero={(img: string) => setDocTrasero(img)}
					docFrontal={docFrontal}
					docTrasero={docTrasero}
				/>
			) : (
				<>
					<div className='grid grid-cols-2 items-center gap-x-4 gap-y-2'>
						<label
							htmlFor='ci-delantero'
							className={`flex cursor-pointer items-center justify-center rounded border-[1px] border-neutral-300 p-2 transition-all hover:bg-neutral-300 ${
								docFrontal && 'bg-green-100 text-green-700'
							}`}
						>
							<h3 className='mr-2 select-none text-center text-sm font-semibold text-black'>
								Parte Frontal
							</h3>
							{docFrontal ? <CheckIcon className='h-6' /> : <AddFileSvg className='h-6' />}
						</label>
						<input
							className='hidden'
							onChange={handleDoc1}
							type='file'
							name='ci-delantero'
							id='ci-delantero'
							accept='image/*'
						/>

						<label
							htmlFor='ci-trasero'
							className={`flex cursor-pointer items-center justify-center rounded border-[1px] border-neutral-300 p-2 transition-all hover:bg-neutral-300 ${
								docTrasero && 'bg-green-100 text-green-700'
							}`}
						>
							<h3 className='mr-2 select-none text-center text-sm font-semibold text-black'>
								Parte Trasera
							</h3>
							{docTrasero ? <CheckIcon className='h-6' /> : <AddFileSvg className='h-6' />}
						</label>
						<input
							className='hidden'
							onChange={handleDoc2}
							type='file'
							name='ci-trasero'
							id='ci-trasero'
							accept='image/*'
						/>
						<div className='relative flex h-[100px] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-300'>
							{docFrontal && (
								<Image
									src={`data:image/jpeg;base64,${docFrontal}`}
									fill
									style={{ objectFit: 'cover' }}
									alt='Cedula frontal'
								/>
							)}
						</div>
						<div className='relative flex h-[100px] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-300'>
							{docTrasero && (
								<Image
									src={`data:image/jpeg;base64,${docTrasero}`}
									fill
									style={{ objectFit: 'cover' }}
									alt='Cedula trasera'
								/>
							)}
						</div>
					</div>
				</>
			)}
			<button
				className='boton-primario mt-6 disabled:cursor-not-allowed disabled:border-neutral-400 disabled:bg-neutral-400'
				disabled={!docFrontal || !docTrasero}
				onClick={submitDocumentos}
			>
				{isLoading ? <LoadingIcon className='h-6' /> : 'Continuar'}
			</button>
			<p className='mt-4 text-sm font-semibold text-red-500'>{aviso}</p>
		</div>
	);
};

export default Documento;
