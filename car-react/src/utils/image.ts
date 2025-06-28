export const createNegativeImage = (
  image: HTMLImageElement,
  width: number,
  height: number
): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Fallback to original image if context is not available
      return resolve(image);
    }

    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue
    }

    ctx.putImageData(imageData, 0, 0);

    const negativeImage = new Image();
    negativeImage.src = canvas.toDataURL();
    negativeImage.onload = () => {
      resolve(negativeImage);
    };
  });
};
