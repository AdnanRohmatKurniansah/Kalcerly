import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

const bucket = 'storage_kalcerly'

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
  })
}

configureCloudinary()

export const uploadToCloudinary = async (file: Express.Multer.File, folder: string): Promise<string> => {
  const result: UploadApiResponse = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    {
      folder: `${bucket}/${folder}`
    }
  )

  return result.secure_url
}

export const deleteFromCloudinary = async (urlOrPublicId: string): Promise<boolean> => {
  try {
    const publicId = extractPublicId(urlOrPublicId)

    if (!publicId) {
      throw new Error('Invalid Cloudinary URL or public_id')
    }

    const result = await cloudinary.uploader.destroy(publicId)

    return result.result === 'ok'
  } catch (error) {
    return false
  }
}

const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/v\d+\/(.+?)\.\w+$/)

  if (!match?.[1]) {
    return null
  }

  return match[1]
}