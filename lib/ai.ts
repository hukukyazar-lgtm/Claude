
import { GoogleGenAI, Type } from "@google/genai";

export interface AIWordPair {
  target: string;
  distractors: string[];
}

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  /**
   * Seviye temasına göre gizemli bir atmosfer mesajı üretir.
   */
  async generateAtmosphere(level: number): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Lumina Quest adlı bir mobil oyun için kısa, gizemli ve epik bir portal mesajı yaz. 
                   Tema: Uzay, hafıza ve geçitler. Seviye: ${level}. 
                   Dil: Türkçe. Maksimum 12 kelime olsun. 
                   Örn: "Mars geçidi titreşiyor, zihnini frekansa ayarla."`,
      });
      return response.text || "Portal senkronizasyonu hazır. Başlamaya hazır mısın?";
    } catch (error) {
      console.error("Lore Hatası:", error);
      return "Kozmik frekans kararlı. Geçit seni bekliyor.";
    }
  }

  /**
   * Belirli bir tema için hedef ve 3 benzer çeldirici kelime üretir.
   */
  async generateThemedWords(theme: string): Promise<AIWordPair[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${theme} temasıyla ilgili 5 adet Türkçe kelime seti üret. 
                   Kritik Kural: Her 'target' (hedef) için üretilen 3 'distractors' (çeldirici), hedef kelime ile AYNI UZUNLUKTA olmalı ve sadece 1-2 harfi farklı olmalı (Örn: GALAKSİ -> GALAKTİK, GALAKSİN, GALAKSİS). 
                   Okunuşları ve yazılışları birbirine aşırı derecede benzemeli.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pairs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    target: { type: Type.STRING, description: "Hatırlanması gereken asıl kelime" },
                    distractors: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "Yazılışı ve harf dizilimi hedefe %90 benzeyen 3 kelime" 
                    }
                  },
                  required: ["target", "distractors"]
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{"pairs":[]}');
      return data.pairs;
    } catch (error) {
      console.error("Kelime Üretim Hatası:", error);
      return [];
    }
  }
}

export const aiService = new AIService();
