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
						{ label: 'Arquitectura', link: '/guides/architecture' },
					],
				},
				{
					label: 'Desarrollo',
					items: [
						{ label: 'Instalación y Configuración', link: '/guides/installation' },
						{ label: 'Guía de Contribución', link: '/guides/contributing' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'Socket.IO Events', link: '/api/socket-io' },
					],
				},
			],
		}),
	],
});
