import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Verifica se o projeto tem a dependência Next.js
const isNextProject = (projectRoot: string): boolean => {
	const packageJsonPath = path.join(projectRoot, 'package.json');
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
		return !!packageJson.dependencies?.next || !!packageJson.devDependencies?.next;
	}
	return false;
};

// Verifica se o projeto usa a pasta `src`
const isUsingSrcFolder = (projectRoot: string): boolean => {
	const srcAppPath = path.join(projectRoot, 'src/app');
	const srcPagesPath = path.join(projectRoot, 'src/pages');
	return fs.existsSync(srcAppPath) || fs.existsSync(srcPagesPath);
};

// Obtém o caminho base para rotas (app ou pages)
const getBaseRoutePath = (projectRoot: string): string | null => {
	const appPath = path.join(projectRoot, isUsingSrcFolder(projectRoot) ? 'src/app' : 'app');
	const pagesPath = path.join(projectRoot, isUsingSrcFolder(projectRoot) ? 'src/pages' : 'pages');
	if (fs.existsSync(appPath)) { return appPath; }
	if (fs.existsSync(pagesPath)) { return pagesPath; }
	return null;
};

// Normaliza o nome da rota, substituindo caracteres inválidos por "-"
const normalizeRouteName = (routeName: string): string => {
	return routeName
		.replace(/[^a-zA-Z0-9\/_-]/g, '-') // Substitui caracteres inválidos por "-"
		.replace(/\/+/g, '/') // Remove barras duplicadas
		.replace(/^-+|-+$/g, '') // Remove "-" no início e no fim
		.toLowerCase(); // Converte para minúsculas
};

// Gera o nome do componente (ex: "view" → "ViewPage")
const generateComponentName = (routeName: string): string => {
	const parts = routeName.split('/');
	const lastPart = parts[parts.length - 1];
	return `${lastPart.charAt(0).toUpperCase()}${lastPart.slice(1)}Page`;
};

// Valida o nome da rota
const validateRouteName = (routeName: string): string | null => {
	const regex = /^[a-zA-Z0-9\/_-]+$/;
	if (!regex.test(routeName)) {
		return 'O nome da rota só pode conter letras, números, "/", "-" e "_".';
	}
	return null;
};

// Cria uma rota com parâmetros dinâmicos (Next.js 15)
const createRouteWithParamsNext15 = async (baseRoutePath: string, routeName: string, paramName: string) => {
	const normalizedRoute = normalizeRouteName(routeName);
	const paramFolder = `[${paramName}]`;
	const fullRoutePath = path.join(baseRoutePath, normalizedRoute, paramFolder);

	// Criar pastas aninhadas
	if (!fs.existsSync(fullRoutePath)) {
		fs.mkdirSync(fullRoutePath, { recursive: true });
	}

	// page.tsx (Next.js 15)
	const componentName = generateComponentName(normalizedRoute);
	const pageContent = `type Props = {
  params: {
    ${paramName}: string;
  };
};

export default async function ${componentName}({ params }: Props) {
  const { ${paramName} } = await params;
  return (
    <div>
      ${componentName}: {${paramName}}
    </div>
  );
}
`;
	fs.writeFileSync(path.join(fullRoutePath, 'page.tsx'), pageContent);

	// Pastas adicionais
	['types', 'componentes'].forEach((folder) => {
		const folderPath = path.join(fullRoutePath, folder);
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
	});

	// Arquivos types/store.type.ts e store.ts
	fs.writeFileSync(path.join(fullRoutePath, 'types/store.type.ts'), '');
	fs.writeFileSync(path.join(fullRoutePath, 'store.ts'), '');

	vscode.window.showInformationMessage(`Rota "${routeName}/[${paramName}]" criada (Next.js 15)!`);
};

// Cria uma rota com parâmetros dinâmicos (Next.js 14 e anteriores)
const createRouteWithParamsLegacy = async (baseRoutePath: string, routeName: string, paramName: string) => {
	const normalizedRoute = normalizeRouteName(routeName);
	const paramFolder = `[${paramName}]`;
	const fullRoutePath = path.join(baseRoutePath, normalizedRoute, paramFolder);

	// Criar pastas aninhadas
	if (!fs.existsSync(fullRoutePath)) {
		fs.mkdirSync(fullRoutePath, { recursive: true });
	}

	// page.tsx (Next.js 14 e anteriores)
	const componentName = generateComponentName(normalizedRoute);
	const pageContent = `type Props = {
  params: {
    ${paramName}: string;
  };
};

export default function ${componentName}({ params }: Props) {
  const { ${paramName} } = params;
  return (
    <div>
      ${componentName}: {${paramName}}
    </div>
  );
}
`;
	fs.writeFileSync(path.join(fullRoutePath, 'page.tsx'), pageContent);

	// Pastas adicionais
	['types', 'componentes'].forEach((folder) => {
		const folderPath = path.join(fullRoutePath, folder);
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
	});

	// Arquivos types/store.type.ts e store.ts
	fs.writeFileSync(path.join(fullRoutePath, 'types/store.type.ts'), '');
	fs.writeFileSync(path.join(fullRoutePath, 'store.ts'), '');

	vscode.window.showInformationMessage(`Rota "${routeName}/[${paramName}]" criada (Next.js 14 e anteriores)!`);
};

export const activate = (context: vscode.ExtensionContext) => {
	context.subscriptions.push(
		vscode.commands.registerCommand('next-helper.createRoute', async (uri: vscode.Uri) => {
			const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (!projectRoot || !isNextProject(projectRoot)) {
				vscode.window.showErrorMessage('Este projeto não é Next.js.');
				return;
			}

			const baseRoutePath = getBaseRoutePath(projectRoot);
			if (!baseRoutePath) {
				vscode.window.showErrorMessage('Diretório app/pages não encontrado.');
				return;
			}

			const routeName = await vscode.window.showInputBox({
				prompt: 'Nome da rota (ex: service/view)',
				validateInput: (value) => validateRouteName(value),
			});
			if (!routeName) { return; }

			const normalizedRoute = normalizeRouteName(routeName);
			const componentName = generateComponentName(normalizedRoute);
			const fullRoutePath = path.join(baseRoutePath, normalizedRoute);

			// Criar pastas aninhadas
			if (!fs.existsSync(fullRoutePath)) {
				fs.mkdirSync(fullRoutePath, { recursive: true });
			}

			// page.tsx
			const pageContent = `const ${componentName} = ({ params }: { params: any }) => (
  <div>${componentName}</div>
);

export default ${componentName};
`;
			fs.writeFileSync(path.join(fullRoutePath, 'page.tsx'), pageContent);

			// Pastas adicionais
			['types', 'componentes'].forEach((folder) => {
				const folderPath = path.join(fullRoutePath, folder);
				if (!fs.existsSync(folderPath)) {
					fs.mkdirSync(folderPath);
				}
			});

			// Arquivos types/store.type.ts e store.ts
			fs.writeFileSync(path.join(fullRoutePath, 'types/store.type.ts'), '');
			fs.writeFileSync(path.join(fullRoutePath, 'store.ts'), '');

			vscode.window.showInformationMessage(`Rota "${routeName}" criada!`);
		}),
		vscode.commands.registerCommand('next-helper.createRouteWithParamsNext15', async (uri: vscode.Uri) => {
			const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (!projectRoot || !isNextProject(projectRoot)) {
				vscode.window.showErrorMessage('Este projeto não é Next.js.');
				return;
			}

			const baseRoutePath = getBaseRoutePath(projectRoot);
			if (!baseRoutePath) {
				vscode.window.showErrorMessage('Diretório app/pages não encontrado.');
				return;
			}

			const routeName = await vscode.window.showInputBox({
				prompt: 'Nome da rota (ex: service/view)',
				validateInput: (value) => validateRouteName(value),
			});
			if (!routeName) { return; }

			const paramName = await vscode.window.showInputBox({
				prompt: 'Nome do parâmetro (ex: servicoId)',
				validateInput: (value) => {
					if (!value || !/^[a-zA-Z]+$/.test(value)) {
						return 'O nome do parâmetro só pode conter letras (a-z, A-Z).';
					}
					return null;
				},
			});
			if (!paramName) { return; }

			await createRouteWithParamsNext15(baseRoutePath, routeName, paramName);
		}),
		vscode.commands.registerCommand('next-helper.createRouteWithParamsLegacy', async (uri: vscode.Uri) => {
			const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			if (!projectRoot || !isNextProject(projectRoot)) {
				vscode.window.showErrorMessage('Este projeto não é Next.js.');
				return;
			}

			const baseRoutePath = getBaseRoutePath(projectRoot);
			if (!baseRoutePath) {
				vscode.window.showErrorMessage('Diretório app/pages não encontrado.');
				return;
			}

			const routeName = await vscode.window.showInputBox({
				prompt: 'Nome da rota (ex: service/view)',
				validateInput: (value) => validateRouteName(value),
			});
			if (!routeName) { return; }

			const paramName = await vscode.window.showInputBox({
				prompt: 'Nome do parâmetro (ex: servicoId)',
				validateInput: (value) => {
					if (!value || !/^[a-zA-Z]+$/.test(value)) {
						return 'O nome do parâmetro só pode conter letras (a-z, A-Z).';
					}
					return null;
				},
			});
			if (!paramName) { return; }

			await createRouteWithParamsLegacy(baseRoutePath, routeName, paramName);
		})
	);
};

export const deactivate = () => { };
