import 'dotenv/config';
import { PrismaClient } from './generated/client/client';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runTest() {
    try {
        console.log('--- Configurando Datos de Prueba ---');
        // 1. Obtener usuario admin - no, lets create a fresh one to avoid password mismatches
        const uniqueEmail = `testreviewer_${Date.now()}@example.com`;
        const registerRes = await axios.post('http://localhost:3001/api/auth/register', {
            name: 'Test Reviewer',
            email: uniqueEmail,
            password: 'password123'
        });
        const token = registerRes.data.token;
        const testUserId = registerRes.data.user.id;
        console.log(`Usuario de prueba creado: ${uniqueEmail}`);

        // 2. Obtener un servicio
        const service = await prisma.service.findFirst();
        if (!service) throw new Error("No services found");

        // 3. Crear una cita COMPLETA sin reseña
        const appointment = await prisma.appointment.create({
            data: {
                dateTime: new Date(),
                status: 'COMPLETED',
                notes: 'Test appointment for API upload test',
                clientId: testUserId,
                serviceId: service.id
            }
        });
        console.log(`Cita de prueba creada: ${appointment.id}`);
        console.log(`Cita de prueba creada: ${appointment.id}`);

        // 4. Token ya obtenido arriba
        console.log('--- Preparando y Enviando Reseña con Foto ---');

        // 5. Preparar datos de la reseña con foto
        console.log('--- Enviando Reseña con Foto ---');
        const form = new FormData();
        form.append('appointmentId', appointment.id);
        form.append('rating', '5');
        form.append('comment', '¡Excelente servicio! Esta es una prueba de backend.');
        
        // Crear una imagen falsa si no existe
        const fakeImageDir = path.join(__dirname, '..', 'temp_test');
        if (!fs.existsSync(fakeImageDir)) fs.mkdirSync(fakeImageDir);
        const fakeImagePath = path.join(fakeImageDir, 'test_image.png');
        fs.writeFileSync(fakeImagePath, 'fake png content'); // solo texto, multer revisa mimetype basado en ext/headers en axios

        form.append('photo', fs.createReadStream(fakeImagePath), {
            filename: 'test_image.png',
            contentType: 'image/png',
        });

        // 6. Hacer la petición POST manual
        const reviewRes = await axios.post('http://localhost:3001/api/reviews', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Reseña creada exitosamente:');
        console.log(reviewRes.data);

        if (reviewRes.data.photoUrl) {
            console.log(`✅ photoUrl guardada correctamente: ${reviewRes.data.photoUrl}`);
            const uploadPath = path.join(__dirname, '..', 'uploads', path.basename(reviewRes.data.photoUrl));
            if (fs.existsSync(uploadPath)) {
                console.log(`✅ El archivo fue guardado en el disco: ${uploadPath}`);
            } else {
                console.log(`❌ ALERTA: El archivo no existe en el disco: ${uploadPath}`);
            }
        } else {
            console.log('❌ ALERTA: No se guardó photoUrl en la respuesta.');
        }

    } catch (error: any) {
        console.error('❌ Error en el test de subida:');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
