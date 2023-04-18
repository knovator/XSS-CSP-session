const searchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(searchParams);

if (params.search) {
  const search = params.search;
  document.write(search);
}

async function addComment() {
  const input = document.getElementById("comment");
  if (!input.value) {
    alert("Please enter comment");
    return;
  }

  const comment = input.value;
  await fetch("/api/comment", {
    method: "POST",
    body: JSON.stringify({
      comment,
    }),
  });
  input.value = "";

  await loadData();
}

async function loadData() {
  const response = await fetch("/api/comment");
  const list = await response.json();
  document.getElementById("output").innerHTML = "";
  const fragment = document.createDocumentFragment();
  list.data.map((data) => {
    const div = document.createElement("div");
    div.style.margin = "10px";
    // div.innerHTML = data.comment;
    div.append(document.createRange().createContextualFragment(data.comment));
    fragment.append(div);
  });
  document.getElementById("output").append(fragment);
}

loadData();
