import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, post, postFile } from "../../utils/fetch";
import styles from "./style.module.scss";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { FileUploader } from "@carbon/react";

interface Society {
  name: string;
  description: string;
  picture?: string;
}

export const SocietyPage = () => {
  const sid = useParams<{ sid: string }>();
  const [societyData, setSocietyData] = useState<Society>({} as Society);
  const [picture, setPicture] = useState(null);

  const handleFileUpload = event => {
    const file = event.target.files[0];
    console.log(file);
    setPicture(file);
  };

  const fetchData = async () => {
    try {
      const response = await get(`society/get-society-by-id/${sid.sid}`).then(
        res => res.json()
      );
      await setSocietyData(response.society);
    } catch (error) {
      console.log(error);
    }

    try {
      const response = await get(`society/get-society-picture/${sid.sid}`).then(
        res => res.json()
      );
      setSocietyData(prev => ({ ...prev, picture: response.societyPicture }));
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFile = async () => {
    if (picture) {
      const response = await postFile(
        `society/upload-society-picture/${sid.sid}`,
        picture
      );
      if (!response.ok) {
        alert("Failed to upload file");
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await uploadFile();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [picture]);

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [sid.sid]);

  return (
    <AuthenticatedRoute>
      <div className={styles.container}>
        <h1>Society Page {sid.sid}</h1>
        <p>Society name: {societyData.name}</p>
        <p>Society description: {societyData.description}</p>
        <div className={styles.headerContent}></div>
        <div className={styles.mainContent}></div>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        <img src={`/${societyData.picture}`} alt="" />
      </div>
    </AuthenticatedRoute>
  );
};
