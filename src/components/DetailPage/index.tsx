import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface Page {
  title: string;
  contents: string;
}

function DetailPage() {
  const params = useParams<{ id: string }>();
  const pageId = params.id;
  const [page, setPage] = useState<Page>({ title: "", contents: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [error, setError] = useState("");
  const docRef = doc(db, "pages", pageId as string);
  const parseTextToTSX = (text: string): React.ReactNode => {
    const linkRegex = /<Link to="([^"]+)">([^<]+)<\/Link>/g;
    let parts: React.ReactNode[] = [];
    let lastIndex = 0;

    text.replace(linkRegex, (match, path, linkText, offset) => {
      parts.push(text.substring(lastIndex, offset));

      parts.push(
        <Link key={offset} to={path} className="text-blue-700 underline">
          {linkText}
        </Link>
      );

      lastIndex = offset + match.length;
      return "";
    });

    parts.push(text.substring(lastIndex));

    return parts;
  };

  async function handleEditBtn() {
    setIsEditing(prev => !prev);

    if (isEditing) {
      await updateDoc(docRef, { contents: editedContent });
    }
  }

  function handleEditContent(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedContent(event.target.value);
  }

  useEffect(() => {
    async function getPageDetails() {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Page;
        setPage(data);
        setEditedContent(data.contents);
      } else {
        setError("Failed getting wikiPage. Please try again later");
      }
    }

    getPageDetails();
  }, [pageId]);

  return (
    <>
      {error !== "" ? (
        <div className="text-rose-600 text-center">{error}</div>
      ) : (
        <></>
      )}
      <div className="flex justify-center py-5">
        <div className="grid grid-rows-10 h-4/6 w-4/5">
          <h1 className="row-span-1 my-2 justify-start text-2xl text-wrap">
            {page.title}
          </h1>
          {isEditing ? (
            <textarea
              cols={30}
              rows={10}
              defaultValue={editedContent}
              onChange={handleEditContent}
              className="row-span-9 my-4 border-2 border-stone-400"
            />
          ) : (
            <div className="row-span-9 my-4 border-2 border-stone-400">
              {parseTextToTSX(editedContent)}
            </div>
          )}
          <div className="grid grid-cols-8">
            <button
              className="col-end-9 btn btn-blue p-2"
              onClick={handleEditBtn}
            >
              {isEditing ? "저장하기" : "수정하기"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetailPage;
