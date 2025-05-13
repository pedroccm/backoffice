import { writeFile, readFile, access, constants } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

// Função auxiliar para verificar se o arquivo existe
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Caminho para o arquivo sessions.json na raiz do projeto
const getFilePath = () => path.join(process.cwd(), 'sessions.json');

export async function GET() {
  try {
    const filePath = getFilePath();
    
    // Verificar se o arquivo existe
    if (!await fileExists(filePath)) {
      // Se não existir, retornar um array vazio
      return NextResponse.json({ sessions: [] });
    }
    
    // Ler o conteúdo do arquivo
    const fileContent = await readFile(filePath, 'utf8');
    const sessions = JSON.parse(fileContent);
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Erro ao ler sessões:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao ler sessões', error: String(error), sessions: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { sessions } = await request.json();
    
    // Caminho para o arquivo sessions.json na raiz do projeto
    const filePath = getFilePath();
    
    // Converter o array de sessões para JSON e salvar no arquivo
    await writeFile(filePath, JSON.stringify(sessions, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'Sessões salvas com sucesso', sessions });
  } catch (error) {
    console.error('Erro ao salvar sessões:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao salvar sessões', error: String(error) },
      { status: 500 }
    );
  }
} 