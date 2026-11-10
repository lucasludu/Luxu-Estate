# Buenas Prácticas y Recomendaciones — Luxe Estate (Next.js)

## 1. Arquitectura y Renderizado (Next.js App Router)
- **Server Components (RSC) por defecto:** Renderizar páginas, layouts y fichas técnicas en el servidor para enviar el mínimo JS al cliente.
- **`"use client"` solo en hojas interactivas:** Aislar filtros, galerías, mapas, calculadoras y botón de favoritos en componentes cliente pequeños.
- **Renderizado híbrido según vista:**
  - **Home / Destacados:** Estático o ISR para carga instantánea.
  - **Detalle de Propiedad (PDP):** ISR con revalidación bajo demanda (`revalidateTag` / `revalidatePath`) al actualizar precios o estado.
  - **Búsqueda y Catálogo (PLP):** SSR con `Suspense` y *skeletons* leyendo `await searchParams`.
- **Filtros en la URL (`searchParams`):** Sincronizar precio, ciudad, habitaciones y orden en la URL para poder compartir enlaces y mantener el historial.
- **Seguridad de datos (`server-only`):** Centralizar las llamadas a Supabase en `lib/` o `data/` protegidas del cliente.
- **Server Actions para mutaciones:** Usar Server Actions con validación para formularios de contacto, agendamiento de visitas y favoritos.

## 2. Rendimiento e Imágenes (Core Web Vitals)
- **Optimización con `next/image`:**
  - Usar `AVIF` / `WebP` automáticos.
  - Aplicar `priority` únicamente en la imagen principal (*Hero*) para mejorar el **LCP**.
  - Definir siempre `sizes` en grillas de tarjetas para no descargar imágenes gigantes en móvil.
  - Usar `placeholder="blur"` o esqueletos con `aspect-ratio` fijo para evitar saltos visuales (**CLS = 0**).
- **Lazy Loading de elementos pesados:** Cargar mapas interactivos, tours 360° y videos con `next/dynamic` solo cuando entren en pantalla.
- **Fuentes optimizadas (`next/font`):** Cargar `SF Pro Display` con `display: 'swap'` sin bloqueo de renderizado.

## 3. SEO Inmobiliario y Captación
- **Metadatos dinámicos (`generateMetadata`):** Generar título, descripción e imagen **OpenGraph** por propiedad (ideal para previsualizaciones en WhatsApp y redes).
- **Rich Snippets (JSON-LD):** Inyectar esquema `RealEstateListing` (precio, moneda, dirección, coordenadas, fotos y estado) en cada propiedad.
- **Slugs semánticos:** Usar URLs descriptivas (`/propiedades/villa-moderna-marbella-id402`) en lugar de IDs puros.
- **Sitemap y Robots dinámicos:** Generar `sitemap.ts` automático con las propiedades activas y evitar indexar combinaciones infinitas de filtros (`canonical`).

## 4. Diseño UX/UI y Conversión (CRO)
- **Fidelidad visual:** Respetar estrictamente la paleta (**Nordic `#19322F`**, **Mosque `#006655`**, **Hint of Green `#D9ECC8`**, **Clear Day `#EEF6F6`**).
- **Property Cards escaneables:** Mostrar solo lo esencial: foto con badge de estado, precio destacado, ubicación y 3-4 iconos clave (habitaciones, baños, $m^2$).
- **CTAs siempre visibles:** Barra lateral fija (*sticky*) en desktop y barra inferior fija en móvil con botones de **"Agendar visita"** y **"WhatsApp"**.
- **Empty States útiles:** Si los filtros no dan resultados, ofrecer un botón de **"Limpiar filtros"** y mostrar propiedades sugeridas.
- **Feedback visual inmediato:** Estados claros de carga (`loading.tsx`), error (`error.tsx`) y propiedad no encontrada (`not-found.tsx`).

## 5. Organización y Calidad de Código
- **Componentes reutilizables y atómicos:** Extraer `<PropertyCard />`, `<FilterBar />`, `<Badge />`, `<PriceTag />` y `<SectionHeader />`.
- **Formateo centralizado:** Crear helpers únicos para moneda (`Intl.NumberFormat`), superficie ($m^2$) y fechas.
- **Tipado estricto (TypeScript):** Interfaces claras para `Property`, `Agent` y `PropertyFilters` alineadas con Supabase.
- **Estructura modular:** Organizar carpetas por dominio/página manteniendo componentes compartidos en `components/ui`.

## 6. Ideas y Funcionalidades Diferenciadoras
- **Calculadora hipotecaria integrada:** Estimar cuota mensual en vivo dentro de la ficha según el precio del inmueble.
- **Mapa interactivo sincronizado:** Vista dividida listado/mapa donde hacer *hover* en la tarjeta resalta el pin con el precio.
- **Comparador de propiedades:** Seleccionar 2 o 3 inmuebles para comparar precio por $m^2$, dimensiones y amenidades lado a lado.
- **Favoritos sin fricción:** Guardar favoritos en `localStorage` sin obligar a registrarse y sincronizar con Supabase al iniciar sesión.
- **Indicadores para inversores:** Mostrar precio por $m^2$ frente al promedio de la zona y rentabilidad estimada de alquiler (*ROI*).
- **Información del vecindario:** Mostrar cercanía a colegios, parques, comercios y transporte en la ficha.
- **Agenda de visita híbrida:** Selector rápido para elegir entre visita presencial o tour en vivo por videollamada.
