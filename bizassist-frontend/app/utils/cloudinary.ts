/**
 * Uploads an image to Cloudinary
 * @param imageUrl - The URL of the image to upload (can be a blob URL, data URL, or external URL)
 * @param folder - Optional folder path in Cloudinary
 * @param uploadPreset - Upload preset name (defaults to 'bizassist_unsigned' or use env variable)
 * @returns The Cloudinary URL of the uploaded image
 */
export async function uploadImageToCloudinary(
  imageUrl: string,
  folder: string = 'bizassist/logos',
  uploadPreset?: string
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset =
    uploadPreset ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    'bizassist_unsigned'

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set')
  }

  try {
    // Handle different URL types
    let fileData: string | File | Blob

    if (imageUrl.startsWith('blob:')) {
      // Convert blob URL to Blob
      const response = await fetch(imageUrl)
      fileData = await response.blob()
    } else if (imageUrl.startsWith('data:')) {
      // Data URL - Cloudinary accepts data URLs directly, but we'll convert to blob for consistency
      const response = await fetch(imageUrl)
      fileData = await response.blob()
    } else if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {
      // External URL - fetch and convert to Blob
      const response = await fetch(imageUrl)
      fileData = await response.blob()
    } else {
      // Fallback: treat as string (for direct file paths)
      fileData = imageUrl
    }

    // Create form data
    const formData = new FormData()
    if (fileData instanceof Blob) {
      formData.append('file', fileData, `logo-${Date.now()}.png`)
    } else {
      formData.append('file', fileData)
    }
    formData.append('upload_preset', preset)
    if (folder) {
      formData.append('folder', folder)
    }

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Cloudinary upload failed: ${errorText}`)
    }

    const data = await response.json()
    return data.secure_url || data.url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

/**
 * Uploads multiple images to Cloudinary
 */
export async function uploadImagesToCloudinary(
  imageUrls: string[],
  folder: string = 'bizassist/logos'
): Promise<string[]> {
  const uploadPromises = imageUrls.map((url) =>
    uploadImageToCloudinary(url, folder).catch((error) => {
      console.error(`Failed to upload image ${url}:`, error)
      return url // Return original URL if upload fails
    })
  )
  return Promise.all(uploadPromises)
}
