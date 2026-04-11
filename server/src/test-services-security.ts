import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from './generated/client/client';

const API = 'http://localhost:3001/api';
const prisma = new PrismaClient();

async function runTest() {
    let passed = 0;
    
    // 1. Test sin token
    try {
        await axios.post(`${API}/services`, {
            name: 'Test Service', price: 100, durationMinutes: 30
        });
        console.error('❌ Falló: POST sin token debería ser rechazado.');
    } catch (e: any) {
        if (e.response?.status === 401) {
            console.log('✅ Éxito: POST sin token denegado con 401');
            passed++;
        } else {
            console.error('❌ Falló: POST sin token dio otro error:', e.response?.status);
        }
    }

    // Preparar usuarios
    const clientEmail = `client_${Date.now()}@test.com`;
    const adminEmail = `admin_${Date.now()}@test.com`;

    try {
        // Registrar Cliente Normal
        const clientRes = await axios.post(`${API}/auth/register`, {
            name: 'Client User', email: clientEmail, password: 'password123'
        });
        const clientToken = clientRes.data.token;

        // Registrar y Promover Administrador
        const adminRes = await axios.post(`${API}/auth/register`, {
            name: 'Admin Test User', email: adminEmail, password: 'password123'
        });
        const adminToken = adminRes.data.token;
        const adminUserObj = adminRes.data.user;

        // Ascender a ADMIN usando Prisma
        await prisma.user.update({
            where: { id: adminUserObj.id },
            data: { role: 'ADMIN' }
        });

        // 2. Test con token de CLIENT
        try {
            await axios.post(`${API}/services`, {
                name: 'Test Service', price: 100, durationMinutes: 30
            }, { headers: { Authorization: `Bearer ${clientToken}` } });
            console.error('❌ Falló: POST con token de cliente debería ser rechazado.');
        } catch (e: any) {
            if (e.response?.status === 403) {
                console.log('✅ Éxito: POST con token de cliente denegado con 403');
                passed++;
            } else {
                console.error('❌ Falló: POST con token de cliente dio otro error:', e.response?.status);
            }
        }

        // 3. Test con token de ADMIN
        let newServiceId = '';
        try {
            const createRes = await axios.post(`${API}/services`, {
                name: 'Admin Test Service', price: 500, durationMinutes: 60
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            
            if (createRes.status === 201) {
                console.log('✅ Éxito: POST con token de admin aceptado con 201');
                newServiceId = createRes.data.id;
                passed++;
            }
        } catch (e: any) {
            console.error('❌ Falló: POST con token de admin rechazado:', e.response?.data);
        }

        if (passed === 3) {
            console.log('🎉 TODOS LOS TESTS DE SEGURIDAD PASARON.');
        } else {
            console.log('⚠️ ALGUNOS TESTS FALLARON.');
        }
        
    } catch (err: any) {
        console.error('Error general del test:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
