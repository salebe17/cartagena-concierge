# Guía para Generar la App de Android (APK) 📱🤖

Esta guía te explica cómo transformar el código de **Cartagena Concierge** en un archivo instalable para celulares Android.

## Requisitos Previos
Necesitas tener instalado en tu computadora:
1.  **Node.js** (Ya lo tienes si estás viendo esto).
2.  **Android Studio** (Descárgalo gratis aquí: [developer.android.com/studio](https://developer.android.com/studio)).

---

## Pasos para Crear la App

### 1. Preparar el Código
Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
npx cap sync
```

Esto "copia" la última versión de tu configuración a la carpeta nativa de Android.

### 2. Abrir en Android Studio
Ejecuta este comando para abrir el proyecto automáticamente:

```bash
npx cap open android
```

Se abrirá Android Studio. Espera a que termine de indexar (la barra inferior derecha).

### 3. Configurar la URL (Muy Importante) ⚠️
Asegúrate de que la App apunte a tu web real.
1.  En Android Studio, ve a la carpeta `app/src/main/assets`.
2.  Verifica que el archivo `capacitor.config.json` (o similar) tenga la URL correcta de Vercel en la sección `server`:
    ```json
    "server": {
        "url": "https://tu-proyecto.vercel.app" 
    }
    ```
    *(Si ya lo configuraste en `capacitor.config.ts`, esto debería estar automático).*

### 4. Probar en un Emulador (Opcional)
Dale al botón verde de "Play" ▶️ en la parte superior para ver la app corriendo en un celular virtual.

### 5. Generar el Archivo APK (Para instalar o subir a Tienda)
1.  Ve al menú superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2.  Espera unos minutos.
3.  Saldrá una notificación: *"APK(s) generated successfully"*. Haz clic en **"locate"**.
4.  ¡Listo! Ese archivo `.apk` puedes enviarlo por WhatsApp a tus anfitriones para que lo instalen (o subirlo a Google Play Console).

---

## Solución de Problemas Comunes

*   **Error "Cleartext Traffic":** Si la app se queda en blanco, es porque tu URL no es `https` segura. Asegúrate de usar siempre `https://`.
*   **La App no actualiza:** Recuerda que configuramos la app en modo "Híbrido". Si haces cambios en Vercel (en la web), la app se actualiza sola al abrirla. Si cambias cosas nativas (iconos, permisos), debes volver a generar el APK.
