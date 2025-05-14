import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Função para salvar a sessão no arquivo sessions.json
export async function POST(request: NextRequest) {
  try {
    // Ler os dados da requisição
    const session = await request.json();
    
    // Caminho para o arquivo sessions.json
    const filePath = path.join(process.cwd(), 'sessions.json');
    
    // Verificar se o arquivo já existe
    let sessions = [];
    if (fs.existsSync(filePath)) {
      // Ler o conteúdo atual do arquivo
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      try {
        sessions = JSON.parse(fileContent);
        // Garantir que sessions é um array
        if (!Array.isArray(sessions)) {
          sessions = [];
        }
      } catch (error) {
        console.error('Erro ao analisar o arquivo sessions.json:', error);
        sessions = [];
      }
    }
    
    // Verificar se a sessão já existe no arquivo
    const sessionIndex = sessions.findIndex((s: any) => s.id === session.id);
    if (sessionIndex >= 0) {
      // Atualizar a sessão existente
      sessions[sessionIndex] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      // Adicionar a nova sessão
      sessions.push({ 
        ...session, 
        updatedAt: new Date().toISOString() 
      });
    }
    
    // Escrever o array atualizado de volta no arquivo
    fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2), 'utf-8');
    
    console.log(`Sessão ${session.id} salva em sessions.json`);
    
    return NextResponse.json({ success: true, message: 'Sessão salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    return NextResponse.json(
      { error: `Erro ao salvar sessão: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 