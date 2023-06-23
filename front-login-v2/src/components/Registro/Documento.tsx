import axios from 'axios';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';
import AddFileSvg from '@/ui/icons/AddFileSvg';
import CheckDocIcon from '@/ui/icons/CheckDocIcon';
import DocumentSvg from '@/ui/icons/DocumentSvg';
import LoadingIcon from '@/ui/icons/LoadingIcon';
import { fileToBase64 } from '@/utils/ConverFile';

type CrearUsuarioResponse = {
	message: 'OK' | string;
};

type Props = {
	continuarRegistro: (cedulaFrontal: string) => void;
};

const Documento = ({ continuarRegistro }: Props) => {
	const router = useRouter();
	const CI = router.query.ci;
	const [isLoading, setIsLoading] = useState(false);
	const [aviso, setAviso] = useState('');
	const [docFrontal, setDocFrontal] = useState('');
	const [docTrasero, setDocTrasero] = useState('');

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
				continuarRegistro(docFrontal);
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
			<div className='mb-4 flex'>
				<label
					htmlFor='ci-delantero'
					className='mr-4 cursor-pointer rounded border-[1px] border-neutral-300 p-2 transition-all hover:bg-neutral-300'
				>
					<div>
						{docFrontal ? (
							<CheckDocIcon className='mx-auto h-12 text-blue-700' />
						) : (
							<AddFileSvg className='mx-auto h-12' />
						)}
						<h3 className='select-none text-sm'>Parte Delantera</h3>
					</div>
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
					className='cursor-pointer rounded border-[1px] border-neutral-300 p-2 transition-all hover:bg-neutral-300'
				>
					{docTrasero ? (
						<CheckDocIcon className='mx-auto h-12 text-blue-700' />
					) : (
						<AddFileSvg className='mx-auto h-12' />
					)}
					<h3 className='select-none text-sm'>Parte Trasera</h3>
				</label>
				<input
					className='hidden'
					onChange={handleDoc2}
					type='file'
					name='ci-trasero'
					id='ci-trasero'
					accept='image/*'
				/>
			</div>
			<p className='mb-4 text-sm font-semibold text-red-500'>{aviso}</p>
			<button className='boton-primario' onClick={submitDocumentos}>
				{isLoading ? <LoadingIcon className='h-6' /> : 'Subir'}
			</button>
		</div>
	);
};

export default Documento;
