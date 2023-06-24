import CameraIcon from '@/ui/icons/CameraIcon';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import Webcam from 'react-webcam';

type Props = {
	setDocFrontal: (img: string) => void;
	setDocTrasero: (img: string) => void;
	docFrontal: string;
	docTrasero: string;
};

type DocumentoSeleccionado = 'docFrontal' | 'docTrasero';

const CamaraDoc = ({ setDocFrontal, setDocTrasero, docFrontal, docTrasero }: Props) => {
	const webcamRef = useRef<Webcam>(null);
	const [docSeleccionado, setDocSeleccionado] = useState<DocumentoSeleccionado>('docFrontal');

	const capturarImg = () => {
		const imageSrc = webcamRef.current?.getScreenshot();
		if (imageSrc) {
			if (docSeleccionado === 'docFrontal') {
				setDocFrontal(imageSrc.split(',')[1]);
			} else {
				setDocTrasero(imageSrc.split(',')[1]);
			}
		}
	};

	const handleInput = (e: ChangeEvent<HTMLInputElement>) =>
		setDocSeleccionado(e.target.id as DocumentoSeleccionado);

	return (
		<>
			<div className='relative mb-6 flex min-h-[250px] items-center overflow-hidden rounded border-[1px] border-neutral-500 bg-black shadow-lg'>
				<Webcam
					audio={false}
					ref={webcamRef}
					screenshotFormat='image/jpeg'
					width='100%'
					height='100%'
					mirrored={true}
					videoConstraints={{ facingMode: 'user' }}
				/>
				<button
					className='absolute bottom-4 right-4 rounded-full bg-blue-700 p-3 text-white transition-all hover:opacity-80'
					onClick={capturarImg}
				>
					<CameraIcon className='h-8' />
				</button>
			</div>
			<fieldset className='flex w-full max-w-[300px]'>
				<label
					htmlFor='docFrontal'
					className={`mr-4 w-full cursor-pointer rounded-lg border-2 ${
						docSeleccionado === 'docFrontal'
							? 'border-blue-700 bg-blue-700 text-white'
							: 'border-gray-300 bg-gray-300'
					}`}
				>
					<div className='rounded-t-lg'>
						<input
							type='radio'
							name='documentos'
							id='docFrontal'
							onChange={handleInput}
							checked={docSeleccionado === 'docFrontal'}
							hidden
						/>
						<p className='select-none p-2 text-center text-sm font-semibold'>Parte Frontal</p>
					</div>
					<div className='relative flex h-[100px] w-full items-center justify-center overflow-hidden rounded-b-lg bg-gray-300'>
						{docFrontal && (
							<Image
								src={`data:image/jpeg;base64,${docFrontal}`}
								fill
								style={{ objectFit: 'cover' }}
								alt='Cedula frontal'
							/>
						)}
					</div>
				</label>

				<label
					htmlFor='docTrasero'
					className={`mr-4 w-full cursor-pointer rounded-lg border-2 ${
						docSeleccionado === 'docTrasero'
							? 'border-blue-700 bg-blue-700 text-white'
							: 'border-gray-300 bg-gray-300'
					}`}
				>
					<div className='rounded-t-lg'>
						<input
							type='radio'
							name='documentos'
							id='docTrasero'
							onChange={handleInput}
							checked={docSeleccionado === 'docTrasero'}
							hidden
						/>
						<p className='select-none p-2 text-center text-sm font-semibold'>Parte Trasera</p>
					</div>
					<div className='relative flex h-[100px] w-full items-center justify-center overflow-hidden rounded-b-lg bg-gray-300'>
						{docTrasero && (
							<Image
								src={`data:image/jpeg;base64,${docTrasero}`}
								fill
								style={{ objectFit: 'cover' }}
								alt='Cedula trasera'
							/>
						)}
					</div>
				</label>
			</fieldset>
		</>
	);
};

export default CamaraDoc;
