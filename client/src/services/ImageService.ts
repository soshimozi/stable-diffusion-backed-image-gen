const { VITE_BASE_URL } = import.meta.env;

export type ImageGenerationOptions = {
  prompt: string;
  model_id: string;
  height?: number;
  width?: number;
  iterations?: number;
  guidance?: number;
  negative_prompt?: string;
  seed?: number;
  num_images?: number;
  /* TODO: add other parameters here */
}

export class ImageService {

  public async startImageJob(accessToken: string, options: ImageGenerationOptions): Promise<string>  {

      const modelUrl = `${VITE_BASE_URL}/job`;

      const generateResponse = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      });


      if( generateResponse.status !== 200)
        throw new Error(`Failed to fetch job with a status of ${generateResponse.status}`)

      const result = await generateResponse.json();
      console.log('json result: ', result);

      return result.job_id;
    }

}
