import { db } from "../firebase/firebase.config";
import {
  collection,
  getDocs,
  DocumentData,
  query,
  where,
} from "firebase/firestore";

class TrieNode {
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;

  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  async linkText(text: string): Promise<string> {
    let linkedText = "";
    let node = this.root;
    let tempText = "";
    let lastMatchIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (node.children[char]) {
        tempText += char;
        node = node.children[char];

        if (node.isEndOfWord) {
          const docId = await getDocId(tempText);
          linkedText += text.substring(lastMatchIndex, i - tempText.length + 1);
          linkedText += `<Link to="/pages/${docId}">${tempText}</Link>`;
          lastMatchIndex = i + 1;
          tempText = "";
          node = this.root;
        }
      } else {
        tempText = "";
        node = this.root;
      }
    }

    linkedText += text.substring(lastMatchIndex);
    return linkedText;
  }
}

async function getDocId(text: string): Promise<string | undefined> {
  const dataRef = collection(db, "pages");
  const q = query(dataRef, where("title", "==", text));
  const docData = await getDocs(q);

  const doc = docData.docs[0];
  return doc.id;
}

async function fetchWikiTitles(): Promise<string[]> {
  const dataRef = collection(db, "pages");
  const snapshot = await getDocs(dataRef);
  const titles = snapshot.docs.map((doc: DocumentData) => doc.data().title);

  return titles;
}

async function buildTrieWithTitles(): Promise<Trie> {
  const trie = new Trie();
  const titles = await fetchWikiTitles();
  titles.forEach((title: string) => trie.insert(title));
  return trie;
}

export async function convertWikiLinks(text: string): Promise<string> {
  const trie = await buildTrieWithTitles();
  return trie.linkText(text);
}
