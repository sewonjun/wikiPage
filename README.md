# WikiPage

## Contents of Table

- [Preview](#preview)

- [Pagination 구현하기](#pagination-구현하기)
  - [실시간 데이터 fetching](#실시간-데이터-fetching)
- [Trie 자료구조를 이용한 자동으로 링크 생성해주기](#trie-자료구조를-이용한-자동으로-링크-생성해주기)

  - [Trie 자료구조](#trie-자료구조)
  - [링크로 변경되는 순서](#링크로-변경되는-순서)

- [개선하고 싶은 점](#개선하고-싶은-점)

  - [data fetching cache](#data-fetching-cache)
  - [pagination](#pagination)
  - [자동 링크 생성](#자동-링크-생성)


## Preview

- 처음페이지에서는 여러개의 위키페이지제목이 목록으로 나옵니다.
- 위키페이지 제목을 클릭하면 제목과 본문을 볼 수 있습니다.
- 처음페이지에 목록으로 보여지는 제목의 갯수는 5개이며, 5개가 넘어가면 페이지를 구분해서 표시합니다.

  <img src="https://github.com/sewonjun/sewonjun_wikiPage/assets/93499071/e8cfb55a-4ff3-4fcc-8e53-6fb99a1e60bb" width=500>

- 메인페이지에서 추가 버튼을 누르면 새로이 입력할 수 있는 창이 나오고, 제목과 내용을 입력할 수 있습니다.

  <img src="https://github.com/sewonjun/sewonjun_wikiPage/assets/93499071/71ebc501-1f22-4762-a0f4-cbbfe6f770b6" width=500>

- 위키내용페이지에는 수정 버튼이 있고, 수정을 누르면 내용을 수정해서 저장할 수 있습니다.

  <img src="https://github.com/sewonjun/sewonjun_wikiPage/assets/93499071/cd88d3d1-a3e8-450f-8b01-4c588b89d71a" width=500>

- 위키페이지 본문에 다른 위키페이지의 제목이 있으면 자동으로 링크가 걸리고,클릭하면 해당 위키페이지로 이동합니다.

  <img src="https://github.com/sewonjun/sewonjun_wikiPage/assets/93499071/64b1ea9b-7ce7-4bff-bb1d-634e0dd586fb" width=500>

## Pagination 구현하기

pagination은 한 페이지에 보여줄 수 있는 데이터 양을 정하고, 그에 따라 페이지를 나눠서 보여주는 프로세스입니다.

pagination을 구현하기 위해서는 일단, 총 몇 페이지가 나오는지 알 수 있어야 합니다. `Math.ceil(datas.length / itemsPerPage)`을 통해 총 페이지 갯수를 구합니다.

```tsx
// src/Home/Index.tsx
{
  Array.from({ length: Math.ceil(datas.length / itemsPerPage) }).map((_, i) => (
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
  ));
}
```

한 페이지에 정해진 데이터 양만 보여줘야 하기 떄문에, 페이지에 따라 가져오는 로직이 필요했습니다.
firstIndex와 lastIndex를 통해 slice 해야 하는 부분을 정해주었습니다.

```js
const lastIndex = currentPage * itemsPerPage;
const firstIndex = lastIndex - itemsPerPage;
const currentItems = datas.slice(firstIndex, lastIndex);
```

**첫 페이지라고 가정할때, lastIndex는 5이다.**

- firstIndex = lastIndex - 5 = 0
- datas.slice(0, 5);

**데이터가 12개인데, 마지막 페이지라고 가정했을 때,**

- lastIndex = (currentPage)3 \* (itemsPerPage)5 = 15
- firstIndex = (lastIndex)15 - (itemsPerPage)5 = 10

- 데이터가 12개이면 lastIndex는 사실 **12**지만, mdn에 따르면 slice 메소드는 `만약 end 값이 배열의 길이보다 크다면, slice()는 배열의 끝까지(arr.length) 추출한다`라고 명시되어 있습니다. -> lastIndex가 15여도 로직이 동작하는 이유입니다.

### 실시간 데이터 fetching

wikiPage를 구현하면서 게시판의 특성상, 데이터가 많고 업데이트가 되는 시기에 맞춰 데이터를 fetch 하기 위해서는 data에 변화가 있을때 data fetching하는 기능이 필요하다고 생각했습니다.

이에 firebase cloud storage에는 값을 가져오기 위해서는 `getDocs`를 사용하는 방법과 `onSnapShot`을 사용하는 방식이 있었습니다. 처음에는 `getDocs`를 사용해서 모든 데이터를 가져왔으나 이 방법은 값을 가져오면 데이터 변경이 일어나도 알지 못했습니다. 이를 해결하기 위해 데이터의 변화가 있을때, 다시 data fetch를 하는 방법을 찾던 중 `onSnapShot`은 래퍼런스 내 모든 데이터를 실시간으로 가져온다는 사실을 알게 됐습니다.

> `onSnapShot`은 document나 collection의 변경 사항을 실시간으로 감지하고 자동으로 가져옵니다.

## Trie 자료구조를 이용한 자동으로 링크 생성해주기

긴 string으로 이루어진 본문에서 기존 title을 찾아내기 위해서 가장 좋은 로직이 무엇일지 고민했습니다. 한번의 순회로 링크로 바꿀 제목이 현재 본문에 포함되어 있는지 판단하는 알고리즘을 찾아야 했습니다.

Trie는 문자열을 저장하고 효율적으로 탐색하기 위한 트리 형태의 자료구조 입니다. Trie 자료구조를 통해 본문의 한번의 순회로 본문안에 위치한 제목들을 Link로 변경하기로 했습니다.

### Trie 자료구조

Trie의 각 노드는 다음 문자를 키로 하는 자식 노드를 가리키는 `children`과 제목의 끝을 나타내는 `isEndOfWord`를 가집니다.

```ts
class TrieNode {
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;

  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}
```

apple, app, car, candy를 insert한다면

```ts
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
```

<img src="https://github.com/sewonjun/sewonjun_wikiPage/assets/93499071/6cff7419-d7a2-42ff-91b0-4b369a084c06" width=300/>

위 그림과 같이 제목을 순회하면서 trie 형태를 만들어갑니다.

### 링크로 변경되는 순서

본문에서 제목이 존재하는지 찾는 과정을 설명을 해보자면 다음과 같습니다.

```ts
export async function convertWikiLinks(text: string): Promise<string> {
  const trie = await buildTrieWithTitles();

  return trie.linkText(text);
}
```

1. 모든 제목들을 firebase에서 가져와 Trie 형태로 구성한다.

```ts
async function buildTrieWithTitles(): Promise<Trie> {
  const trie = new Trie();
  const titles = await fetchWikiTitles();
  titles.forEach((title: string) => trie.insert(title));

  return trie;
}
```

2. 주어진 본문을 Trie의 메소드 linkText 함수에 전달한다. 이 함수는 텍스트를 순회하며 1번에서 return한 trie를 사용해 타이틀이 있는지 검색한다.

```ts
// Trie의 method
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
```

3. 타이틀을 찾을 때마다 Firebase에서 해당 타이틀의 문서 ID를 조회하고, 이를 사용하여 링크를 생성한다.

```ts
async function getDocId(text: string): Promise<string | undefined> {
  const dataRef = collection(db, "pages");
  const q = query(dataRef, where("title", "==", text));
  const docData = await getDocs(q);

  const doc = docData.docs[0];

  return doc.id;
}
```

4. 최종적으로 모든 타이틀에 대한 링크가 추가된 본문을 firebase cloud storage에 저장한다.

> 링크로 바뀐 본문 예시) <br/>
> `자바스크립트15글입니다. <Link to="/pages/YMFOY0pOzX087Nd4XxTX">강의 4</Link>를 참고해주세요.`

## 개선하고 싶은 점

### data fetching cache

서버에서 값을 받아오는 데이터들을 보통 server state라고 부릅니다. 예전에는 redux를 활용해서 local state, server state 함께 상태관리를 했지만, 관심사 분리가 어렵습니다. 또한, 비동기 데이터를 React Component의 state에 보관하는 경우 다수의 component lifecycle에 따라 비동기 데이터가 괸리되므로 캐싱 등 최적화를 수행하기 힘듭니다.

위와 같은 이유 때문에 server state를 따로 관리하는 React Query, SWR, RTK Query 같은 server state 라이브러리들이 생기기 시작했습니다. 이는 선언적으로 프로그래밍이 가능하게 하고, 동일한 api는 한번만 실행하고, 데이터가 더러워진 경우 적절한 시점에 알아서 업데이트를 가능하게 해줬습니다.

지금 현재 데이터가 추가되거나, 수정되면 data fetching이 일어나고 있지만, 현재 data cache가 이루어지고 있지는 않습니다. server 요청이 잦은 게시판의 특성을 고려하여 react-query를 활용하여, 데이터의 변화가 없다면 fetch 요청을 보내지 않도록 cache 기능을 구현하고 싶습니다.

### pagination

현재 모든 데이터를 한번에 가져와서 pagination을 하고 있습니다. 이 방법 대신, 데이터를 정렬 할 수 있다면,
page를 이동할때마다 그 페이지에 해당하는 데이터를 가져오고 싶습니다. 현재 코드에서 제약 사항은 onSnapShot은 데이터를 정렬해서 가져오는 기능이 없습니다. 또한, 현재 고유한 id를 규칙성 없게 부여했기 때문에, 정렬의 기준이 작성 날짜밖에 없습니다.

pagination을 구현시, 현재 페이지에 해당하는 데이터만 fetch 해오기 위해서는

- 데이터를 정렬 시킬 수 있어야 한다.
- 정렬 기준이 있어야 한다.

는 조건이 있다는 사실을 이해하게 되었습니다.

### 자동 링크 생성

본문에 "링크 생성 16"이 있고, 제목으로 "링크 생성 1"과 "링크 생성 16"이 있다면, "현재 링크 생성 1"를 바라보는 링크가 생성되고 있습니다. 이 부분은 기준이 정해져 있지 않기 때문에 "링크 생성 1"이 링크로 변동되어도 이상하지 않고, "링크 생성 16"이 링크로 생성되어도 이상하지 않습니다. 하지만, 제가 생각하는 보편적인 방향은 "링크 생성 16"이 링크로 변하는 것이기 때문에 만약 협업이라면 이 부분은 동료들과 의논하면 좋은 부분일것 같습니다.
