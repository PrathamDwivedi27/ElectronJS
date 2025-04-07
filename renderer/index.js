document.getElementById("selectFolderBtn").addEventListener("click", async () => {
  // This will still trigger queue population, but we won’t use returned list
  await window.Electron.selectDirectory();
});

const list = document.getElementById("videoList");

window.Electron.onJobStarted(({ fileName }) => {
  const li = document.createElement("li");
  li.id = `job-${fileName}`;
  li.innerHTML = `<span class="text-yellow-400">⏳ Processing:</span> ${fileName}`;
  list.appendChild(li);
});

window.Electron.onJobCompleted(({ fileName }) => {
  const li = document.getElementById(`job-${fileName}`);
  if (li) li.innerHTML = `<span class="text-green-400">✅ Done:</span> ${fileName}`;
});

window.Electron.onJobFailed(({ fileName, error }) => {
  const li = document.getElementById(`job-${fileName}`);
  if (li) li.innerHTML = `<span class="text-red-400">❌ Failed:</span> ${fileName} <br/> ${error}`;
});
