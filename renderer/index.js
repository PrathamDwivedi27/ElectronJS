document.getElementById("selectFolderBtn").addEventListener("click", async () => {
    const files = await window.electronAPI.selectDirectory();
    console.log("Video Files:", files);
  
    // Display in HTML (example)
    const list = document.getElementById("videoList");
    list.innerHTML = "";
    files.forEach(file => {
      const li = document.createElement("li");
      li.textContent = file;
      list.appendChild(li);
    });
  });
  