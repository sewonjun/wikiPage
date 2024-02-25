import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase.config";
import { convertWikiLinks } from "../../util/checkTitle.js";

function PageForm() {
  const [page, setPage] = useState({
    title: "",
    contents: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function addPage(e: any) {
    e.preventDefault();

    try {
      const collectionRef = collection(db, "pages");
      const q = query(collectionRef, where("title", "==", `${page.title}`));
      const isTitle = await getDocs(q);

      if (isTitle.empty) {
        const convertedTexts = await convertWikiLinks(page.contents);

        await addDoc(collection(db, "pages"), {
          title: page.title,
          contents: convertedTexts,
        });

        navigate("/");
      } else {
        scrollTo(0, 0);
        throw new Error("이미 존재하는 제목입니다");
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  function handleTiTle(e: any) {
    setPage({
      ...page,
      title: e.target.value,
    });
  }

  function handleContents(e: any) {
    setPage({
      ...page,
      contents: e.target.value,
    });
  }

  return (
    <form className="flex justify-center">
      <div className="flex-col h-4/6 w-4/5">
        <div className="basis-1/6 my-4 justify-start">
          <label>
            제목
            <input
              type="text"
              placeholder="제목을 입력하세요"
              onChange={event => handleTiTle(event)}
              className="w-full"
            />
            {error === "이미 존재하는 제목입니다" ? (
              <div className="text-red-600 text-sm">{error}</div>
            ) : (
              <></>
            )}
          </label>
        </div>
        <label className="basis-5/6">
          본문
          <div className="my-4 border-2 border-stone-400 h-96">
            <textarea
              placeholder="본문을 입력하세요"
              onChange={event => handleContents(event)}
              style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
              className="w-full h-full resize-none"
            ></textarea>
          </div>
        </label>
        <div className="flex justify-end">
          <button onClick={event => addPage(event)} className="btn btn-blue">
            글 저장
          </button>
        </div>
      </div>
    </form>
  );
}

export default PageForm;
