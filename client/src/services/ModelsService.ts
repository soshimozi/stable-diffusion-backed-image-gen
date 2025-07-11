import type { AIModel } from "../types/AIModel";

const { VITE_BASE_URL } = import.meta.env;

export class ModelsService {

  public async getModels(accessToken: string): Promise<AIModel[]>  {

      const modelUrl = VITE_BASE_URL + "models";
      
      const modelsResponse = await fetch(modelUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store"
      });

      const jsonResponse = await modelsResponse.json();

      console.log('jsonResponse ', jsonResponse);

      return jsonResponse;
    }
}
