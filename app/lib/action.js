"use server"
import { writeFile } from 'fs/promises';
import path from "path";

export const uploadImage = async (formData) => {
    const { img  } =
      Object.fromEntries(formData);
      if(img.name !== "undefined"){
        const bytes = await img.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const desiredPath = path.join(process.cwd(), 'public','images',img.name);
        console.log(desiredPath)
        await writeFile(desiredPath, buffer);
      }
};


export const uploadImageLogin = async (formData) => {
  const { img  } =
    Object.fromEntries(formData);
    if(img.name !== "undefined"){
      const bytes = await img.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const desiredPath = path.join(process.cwd(), 'public',img.name);;
      await writeFile(desiredPath, buffer);
    }
}