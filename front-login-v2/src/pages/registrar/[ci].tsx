import { useState } from 'react';
import { useRouter } from 'next/router';
import Documento from '@/components/Registro/Documento';
import Facial from '@/components/Registro/Facial';

function CrearUsuario() {
	const router = useRouter();
	const CI = router.query.ci as string;
	const [registroDocumento, setRegistroDocumento] = useState(true);
	const [cedulaFrontal, setCedulaFrontal] = useState('');

	const continuarRegistro = (cedulaFrontal: string) => {
		setRegistroDocumento(false);
		setCedulaFrontal(cedulaFrontal);
	};

	return registroDocumento ? (
		<Documento continuarRegistro={continuarRegistro} />
	) : (
		<Facial cedulaFrontal={cedulaFrontal} ci={CI} volver={() => setRegistroDocumento(true)} />
	);
}

export default CrearUsuario;
