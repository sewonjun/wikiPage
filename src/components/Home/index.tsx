import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase/firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

interface Docs {
  title: string;
  contents: string;
  id: string;
}

function Home() {
  const [datas, setDatas] = useState<Docs[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string>("");
  const itemsPerPage = 5;
  const navigate = useNavigate();

  function navigateToForm() {
    navigate("/pageForm");
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const collectionRef = collection(db, "pages");

        return onSnapshot(collectionRef, snapshot => {
          const datasArr = snapshot.docs.map(
            doc =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Docs
          );

          setDatas(datasArr);
        });
      } catch {
        setError("getting data from firebase failed");
      }
    }

    fetchData();
  }, []);

  function pagination(pageNumber: number) {
    setCurrentPage(pageNumber);
  }

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = datas.slice(firstIndex, lastIndex);

  if (error) return <div>{error}</div>;

  return (
    <div className="w-full py-10 px-20">
      <h1 className="text-2xl my-6">글 목록</h1>
      <div className="space-y-3">
        {currentItems.map((doc, index) => (
          <Link
            key={doc.id}
            to={`/pages/${doc.id}`}
            className="block border p-3 rounded-lg hover:bg-gray-100"
          >
            <div key={index}>{doc.title}</div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center my-5">
        <ul className="flex list-none">
          {Array.from({ length: Math.ceil(datas.length / itemsPerPage) }).map(
            (_, i) => (
              <li key={i} className="mx-1">
                <button
                  onClick={() => pagination(i + 1)}
                  className={
                    "px-3 py-1 border rounded hover:bg-blue-500 hover:text-white transition-colors " +
                    (currentPage - 1 == i ? "bg-blue-500" : "")
                  }
                >
                  {i + 1}
                </button>
              </li>
            )
          )}
        </ul>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => navigateToForm()}
          className="p-2 m-3 btn btn-blue p-2"
        >
          글 생성
        </button>
      </div>
    </div>
  );
}

export default Home;
