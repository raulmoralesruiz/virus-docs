// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	site: 'https://virusdocs.raulmorales.eu',
	integrations: [
		mermaid(),
		starlight({
			title: 'Virus Project Docs',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/raulmoralesruiz/virus-docs' },
			],
			sidebar: [
				{
					label: 'General',
					items: [
						{ label: 'Visión General', link: '/' },
						{ label: 'Reglas y Mecánicas', link: '/guides/game-mechanics' },
					],
				},
				{
					label: 'Arquitectura',
					items: [
						{ label: 'Visión General', link: '/guides/architecture' },
						{ label: 'Frontend (Angular)', link: '/guides/frontend-architecture' },
						{ label: 'Backend (Node.js)', link: '/guides/backend-architecture' },
					],
				},
				{
					label: 'Desarrollo',
					items: [
						{ label: 'Instalación y Configuración', link: '/guides/installation' },
						{ label: 'Testing', link: '/guides/testing' },
						{ label: 'Guía de Contribución', link: '/guides/contributing' },
					],
				},
				{
					label: 'Referencias',
					items: [
						{ label: 'API Socket.IO', link: '/api/socket-io' },
						{ label: 'Glosario', link: '/reference/glossary' },
					],
				},
			],
		}),
	],
});
