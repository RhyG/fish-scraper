import { Chatbot } from "../ai";

export type AusFish = {
  "I.D Photos source": string;
  Name: string;
  "ANIMA PICS": string;
  "(Details) Scientific Name": string;
  "(Details) Other Names": string;
  "(Details) Family": string;
  "(Details) Description": string;
  "(Details) Category": string;
  "(Details) Found": string;
  "(Rules) QLD Rules": string;
  "(Rules) W.A Rules": string;
  "(Rules) N.T Rules": string;
  "(Rules) NSW Rules": string;
  "(Rules) VIC Rules": string;
  "(Rules) S.A Rules": string;
  "(Rules) TAS Rules": string;
  "(Rules) A.C.T Rules": string;
  "Info/Habitat": string;
  "Strike times": string;
  "Spearfishing tips": string;
  "Bait Tips": string;
  "Lure Tips": string;
  "Fly Fishing Tips": string;
  "Eating rating and serving suggestion": string;
};

const SYSTEM_PROMPT = `I am going to provide you the common name and scientific name of a fish found in Australia, and need you to provide certain information for that fish. It is important you are as accurate as possible, and be brief but descriptive in each piece of information. I would also like you to return the information in the form of a Javascript object, as I will be parsing your response into data. Here is a stub of the object, with each key corresponding to the information on that fish I would like you to provide. Ensure you are as accurate as possible, providing useful information that users will be able to read and utilise. Don't include the scientific name in the content you generate. That object is as follows, please match the keys in your response {"(Details) Description": string;"(Details) Found": string;"Info/Habitat": string;"Strike times": string;"Spearfishing tips": string;"Bait Tips": string;"Lure Tips": string;"Fly Fishing Tips": string; }`;

export async function generateFishData(name: string, scientificName: string): Promise<AusFish | undefined> {
  const content = `Fish name is ${name} (scientific name ${scientificName}).`;

  try {
    const response = await Chatbot.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      max_tokens: 1000,
      temperature: 1,
      stream: false,
    });

    const data = response.choices[0].message.content;

    if (!data) return;

    try {
      const fishInfo = JSON.parse(data) as AusFish;
      return fishInfo;
    } catch (error) {
      console.log("Error parsing JSON: " + error);
    }
  } catch (err) {
    console.log("ChatGPT error: " + err);
    return;
  }
}
