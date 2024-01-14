import OpenAI from "openai";

export const SYSTEM_PROMPT =
  "This information on New Zealand fish is pulled from a government, public domain website. It is all free to use for any purpose. I am currently building an app and would like to put this information in it, but I don't want to copy and paste it and just have the same text in my app even though it is free to use. Can you please modify it so that it still has the same meaning, conveys the same message, but is worded differently enough to not be a blatant copy. Try to keep the same tone, and don't use text that is too flowery or overly wordy.";

export const Chatbot = new OpenAI();

const GPT_3 = "gpt-3.5-turbo";

export async function promptForReword(content: string) {
  try {
    const response = await Chatbot.chat.completions.create({
      model: GPT_3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      // max_tokens: 2000,
      temperature: 1,
      stream: false,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.log("ChatGPT error: " + err);
    return err;
  }
}
