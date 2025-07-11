import type { AIModel } from "../types/AIModel";

const { VITE_BASE_URL } = import.meta.env;

export type ImageGenerationOptions = {
  prompt: string;
  model_id: string;

  /* TODO: add other parameters here */
}

export class ImageService {

  public async generateImage(accessToken: string, options: ImageGenerationOptions): Promise<Blob>  {

      const queryString = new URLSearchParams({prompt: options.prompt, model_id: options.model_id}).toString();

      // TODO: get from .env
      const modelUrl = `${VITE_BASE_URL}generate?${queryString}`;

      const generateResponse = await fetch(modelUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow", // default, but explicit
        mode: "cors",       // needed if Modal and frontend are on different origins        
      });


      const blob = await generateResponse.blob();
      // const url = URL.createObjectURL(blob);

      return blob;
    }

  public async generateImageAsync(accessToken: string, options: ImageGenerationOptions): Promise<string>  {

      const queryString = new URLSearchParams({prompt: options.prompt, model_id: options.model_id}).toString();

      // TODO: get from .env
      const modelUrl = `${VITE_BASE_URL}generate-async?${queryString}`;

      const generateResponse = await fetch(modelUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });


      const result = await generateResponse.json();
      console.log('json result: ', result);

      return result.job_id;
      //const blob = await generateResponse.blob();
      // const url = URL.createObjectURL(blob);

      //return blob;
    }

}
