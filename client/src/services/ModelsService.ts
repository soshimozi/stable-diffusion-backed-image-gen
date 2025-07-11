import type { AIModel } from "../types/AIModel";
import dotenv from 'dotenv';

dotenv.config();

export class ModelsService {

  public async getModels(accessToken: string): Promise<AIModel[]>  {

      const modelUrl = process.env.BASE_URL + "models";
      
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
