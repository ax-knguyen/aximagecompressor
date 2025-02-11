import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image, settings } = req.body;
    console.log('Received settings:', settings);

    const buffer = Buffer.from(image, 'base64');
    
    // Obtenons d'abord les métadonnées de l'image
    const metadata = await sharp(buffer).metadata();
    console.log('Original image metadata:', metadata);

    let sharpInstance = sharp(buffer);

    if (settings.width || settings.height) {
      // Assurons-nous que width et height sont des nombres
      const width = settings.width ? Number(settings.width) : undefined;
      const height = settings.height ? Number(settings.height) : undefined;
      
      // Calculons les dimensions en maintenant le ratio si nécessaire
      let finalWidth = width;
      let finalHeight = height;
      
      if (width && !height && metadata.height && metadata.width) {
        // Si seule la largeur est spécifiée, calculons la hauteur proportionnelle
        finalHeight = Math.round((width * metadata.height) / metadata.width);
      } else if (height && !width && metadata.height && metadata.width) {
        // Si seule la hauteur est spécifiée, calculons la largeur proportionnelle
        finalWidth = Math.round((height * metadata.width) / metadata.height);
      }

      console.log('Resizing with dimensions:', { finalWidth, finalHeight });
      
      sharpInstance = sharpInstance.resize(finalWidth, finalHeight, {
        fit: 'inside',
        withoutEnlargement: false // Permettre l'agrandissement si nécessaire
      });
    }

    let outputBuffer;
    switch (settings.format) {
      case 'webp':
        outputBuffer = await sharpInstance
          .webp({ 
            quality: settings.quality,
            effort: 4 // Meilleur compromis entre vitesse et qualité
          })
          .toBuffer();
        break;
      case 'avif':
        outputBuffer = await sharpInstance
          .avif({ 
            quality: settings.quality,
            effort: 4
          })
          .toBuffer();
        break;
      case 'jpeg':
        outputBuffer = await sharpInstance
          .jpeg({ 
            quality: settings.quality,
            mozjpeg: true // Meilleure compression
          })
          .toBuffer();
        break;
      case 'png':
        outputBuffer = await sharpInstance
          .png({ 
            quality: settings.quality,
            compressionLevel: 9 // Maximum compression
          })
          .toBuffer();
        break;
      default:
        throw new Error('Format non supporté');
    }

    // Vérifions les métadonnées de l'image de sortie
    const outputMetadata = await sharp(outputBuffer).metadata();
    console.log('Output image metadata:', outputMetadata);

    res.status(200).json({
      optimizedImage: outputBuffer.toString('base64'),
      size: outputBuffer.length,
      metadata: {
        width: outputMetadata.width,
        height: outputMetadata.height,
        format: outputMetadata.format
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'optimisation" });
  }
} 