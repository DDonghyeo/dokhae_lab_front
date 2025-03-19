let pollingInterval = null;
let paragraphMap = new Map(); // key: id, value: status

function loadParagraphs() {
  console.log("load paragraphs....")

  apiRequest('/api/paragraph/brief')
    .then(data => {
      let needPolling = false;

      data.forEach(item => {
        const existing = document.querySelector(`.paragraph[data-id="${item.id}"]`);
        const createdAt = new Date(item.createdAt).toLocaleDateString();

        let statusText = '';
        let statusIcon = '';
        switch (item.status) {
          case 'CREATED':
            statusText = '생성 중...';
            statusIcon = '<img class="status_icon" src="images/loading.gif">';
            needPolling = true;
            break;
          case 'ANALYZING':
            statusText = '분석 중...';
            statusIcon = '<img class="status_icon" src="images/loading.gif">';
            needPolling = true;
            break;
          case 'COMPLETE':
            statusText = '분석 완료';
            statusIcon = '<img class="status_icon" src="images/circle-check-solid.png">';
            break;
          case 'CRASHED':
            statusText = '오류 발생';
            statusIcon = '';
            break;
        }

        // 이미 존재하면 status만 업데이트
        if (existing) {
          const currentStatus = paragraphMap.get(item.id);
          if (currentStatus !== item.status) {
            // Status 변경된 경우 업데이트
            const statusBar = existing.querySelector('.paragraph_status_bar span:last-child');
            statusBar.innerHTML = `${statusText} ${statusIcon}`;
            existing.querySelector('.paragraph_title').textContent = item.title ? item.title : '분석 중...';
            existing.setAttribute('data-status', item.status);
            paragraphMap.set(item.id, item.status);
          }
        } else {
          // 새 paragraph 추가
          const container = document.querySelector('.paragraph_container');
          const paragraphDiv = document.createElement('div');
          paragraphDiv.className = 'paragraph';
          paragraphDiv.setAttribute('data-id', item.id);
          paragraphDiv.setAttribute('data-status', item.status);
        
          const title = item.title ? item.title : "분석 중...";

          paragraphDiv.innerHTML = `
            <h1 class="paragraph_title">${title}</h1>
            <span class="paragraph_content">${item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content}</span>
            <div class="paragraph_status_bar">
              <span>${createdAt}</span>
              <span>${statusText} ${statusIcon}</span>
            </div>
          `;
          // add button 위에 추가
          const addBtn = document.getElementById('add_paragraph');
          addBtn.addEventListener("click", openModal)
          container.insertBefore(paragraphDiv, addBtn);

          // 클릭 이벤트
          paragraphDiv.addEventListener('click', () => {
            const currentStatus = paragraphDiv.getAttribute('data-status'); // 매번 최신 상태 읽기!
            if (currentStatus === 'CREATED' || currentStatus === 'ANALYZING') {
              alert('분석 중입니다. 잠시만 기다려 주세요.');
              return;
            }
            openDetailModal(item.id);
          });

          paragraphMap.set(item.id, item.status);
        }
      });

      // 폴링
      if (needPolling && !pollingInterval) {
        pollingInterval = setInterval(loadParagraphs, 5000);
      }
      if (!needPolling && pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    })
    .catch(err => {
      console.error('지문 조회 실패', err)
      alert("로그인이 필요한 서비스입니다.")
      open_login()
    });
}

// 최초 호출
window.addEventListener('load', () => {
  loadParagraphs();
  document.getElementById('close_modal').addEventListener('click', closeModal);
});



// 모달 열기
function openModal() {
  document.querySelector('.modal_container').classList.remove('hidden');
}

// 모달 닫기
function closeModal() {
  document.querySelector('.modal_container').classList.add('hidden');
}



// 분석 생성
document.querySelector('.analyze-btn').addEventListener('click', () => {

  const text = document.querySelector('.text-inputs textarea').value.trim();
  if (!text) {
    alert("지문을 입력해 주세요.");
    return;
  }
  closeModal();
  // const container = document.querySelector('.paragraph_container');
  // const paragraphDiv = document.createElement('div');
  // paragraphDiv.className = 'paragraph';
  // paragraphDiv.setAttribute('data-id', null);
  // paragraphDiv.innerHTML = `
  //   <h1 class="paragraph_title">분석 중...</h1>
  //   <span class="paragraph_content">${text > 150 ? textsubstring(0, 150) + '...' : text}</span>
  //   <div class="paragraph_status_bar">
  //     <span>생성 중...</span>
  //     <span>생성 중... <img class="status_icon" src="images/loading.gif"></span>
  //   </div>
  // `;

  // const addButton = document.getElementById('add_paragraph');
  // container.insertBefore(paragraphDiv, addButton);
  
  apiRequest('/api/paragraph/analyze', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
    .then(() => {
      closeModal();
      loadParagraphs(); // 새로고침
    })
    .catch(() => alert('분석 생성 실패'));
    
});












// ------------------ 분석상세조회-------------------

// 1. 모달 열기 & 닫기
const modalContainer = document.querySelector('.paragraph_modal_container');
const closeModalBtn = document.getElementById('close_paragraph_modal');

function openDetailModal(id) {
  modalContainer.classList.remove('hidden');
  modalContainer.setAttribute('data-id', id);
  loadDetail(id);

  const modalContent = modalContainer.querySelector('.paragraph_modal_content');
  modalContent.scrollTop = 0;
}

function closeDetailModal() {
  modalContainer.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeDetailModal);

// 2. 분석 상세 조회
function loadDetail(id) {
  apiRequest(`/api/paragraph?id=${id}`)
    .then(data => {
      // Title, content, sentences 등 각각 채우기
      document.querySelector('.paragraph_block.title span').textContent = data.title || '';
      document.querySelector('.paragraph_block.sentences span').innerHTML = data.sentences.join('<br>');
      document.querySelector('.paragraph_block.summary span').textContent = data.summary || '';
      document.querySelector('.paragraph_block.introduction span').textContent = data.introduction || '';
      document.querySelector('.paragraph_block.development span').textContent = data.development || '';
      document.querySelector('.paragraph_block.conclusion span').textContent = data.conclusion || '';
      document.querySelector('.paragraph_block.grammarpoint span').textContent = data.grammarPoint || '';
      document.querySelector('.paragraph_block.readingpoint span').textContent = data.readingPoint || '';
      document.querySelector('.paragraph_block.wordpoints span').innerHTML = data.wordPoints.join('<br>');

      const createdDate = new Date(data.createdAt).toLocaleDateString();
      const statusBarSpans = document.querySelectorAll('.paragraph_detail_status_bar span');
      statusBarSpans[0].textContent = `생성 : ${createdDate}`;
    })
    .catch(err => alert('상세 조회 실패: ' + err));
}

// 3. 수정 기능
const editGroups = document.querySelectorAll('.edit_group');
editGroups.forEach(group => {
  const editBtn = group.querySelector('.edit');
  const refreshBtn = group.querySelector('.refresh');
  const aiConfirmBtn = group.querySelector('.refresh-confirm');
  const cancelBtn = group.querySelector('.refresh-cancle');
  const span = group.parentElement.querySelector('span');

  // ✅ 수정용 완료 버튼 새로 생성
  let editConfirmBtn = group.querySelector('.edit-confirm');
  if (!editConfirmBtn) {
    editConfirmBtn = document.createElement('button');
    editConfirmBtn.className = 'edit-confirm hidden';
    editConfirmBtn.textContent = '완료';
    group.insertBefore(editConfirmBtn, aiConfirmBtn); // AI 버튼 앞에 삽입
  }

  editBtn.addEventListener('click', () => {
    // textarea가 이미 있다면 재활용
    let textarea = group.parentElement.querySelector('.edit-input');
    if (!textarea) {
      textarea = document.createElement('textarea');
      textarea.className = 'edit-input';
      group.parentElement.insertBefore(textarea, group); // span 바로 아래에
    }
    textarea.value = span.innerText;

    // 기존 span 숨김
    span.classList.add('hidden');
    textarea.classList.remove('hidden');

    // 수정 관련 버튼 toggle
    aiConfirmBtn.classList.add('hidden');
    cancelBtn.classList.remove('hidden');
    editBtn.classList.add('hidden');
    refreshBtn.classList.add('hidden');
    editConfirmBtn.classList.remove('hidden');

    // textarea 스타일 span과 맞춤
    textarea.style.width = '100%';
    textarea.style.minHeight = '100px';
    textarea.style.marginTop = '10px';
    textarea.style.padding = '10px';
  });

  cancelBtn.addEventListener('click', () => {
    const textarea = group.parentElement.querySelector('.edit-input');
    span.classList.remove('hidden');
    textarea.classList.add('hidden');
    editBtn.classList.remove('hidden');
    editConfirmBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    refreshBtn.classList.remove('hidden');
  });

  editConfirmBtn.addEventListener('click', () => {
    const textarea = group.parentElement.querySelector('.edit-input');
    const section = group.parentElement.classList[1];
    const id = modalContainer.getAttribute('data-id');
    const content = textarea.value.trim();
    if (!content) return alert('내용을 입력해 주세요.');

    apiRequest('/api/paragraph', {
      method: 'PUT',
      body: JSON.stringify({ id, section, content })
    })
    .then(() => {
      loadDetail(id);
      span.classList.remove('hidden');
      textarea.classList.add('hidden');
      editBtn.classList.remove('hidden');
      editConfirmBtn.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      refreshBtn.classList.remove('hidden');
    })
    .catch((err) => alert('수정 실패: '+ err));
  });
});

// 4. AI 재생성 기능
editGroups.forEach(group => {
  const refreshBtn = group.querySelector('.refresh');
  const confirmBtn = group.querySelector('.refresh-confirm');
  const cancelBtn = group.querySelector('.refresh-cancle');
  const promptInput = group.querySelector('.prompt');

  refreshBtn.addEventListener('click', () => {
    refreshBtn.classList.add('hidden');
    confirmBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
    promptInput.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    refreshBtn.classList.remove('hidden');
    confirmBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    promptInput.classList.add('hidden');
  });

  confirmBtn.addEventListener('click', () => {
    const id = modalContainer.getAttribute('data-id');
    const section = group.parentElement.classList[1];
    refreshBtn.classList.remove('hidden');
    confirmBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    promptInput.classList.add('hidden');
    refreshBtn.textContent = '재 생성 중...';
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '재 생성 중... <img class="status_icon" src="images/loading.gif">';

    apiRequest('/api/paragraph/refresh', {
      method: 'POST',
      body: JSON.stringify({ id, section })
    })
    .then(() => {
      loadDetail(id);
      refreshBtn.disabled = false;
      refreshBtn.innerText = 'AI 재 생성';
      refreshBtn.classList.remove('hidden');
      confirmBtn.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      promptInput.classList.add('hidden');
    })
    .catch((err) => alert('재생성 실패: '+err));
  });
});

// 5. PDF 생성
const pdfBtn = document.querySelector('.generate-pdf');
pdfBtn.addEventListener('click', () => {
  const id = modalContainer.getAttribute('data-id');
  pdfBtn.disabled = true;
  pdfBtn.innerHTML = '생성 중... <img class="status_icon" src="images/loading.gif">';

  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${API_BASE_URL}/api/paragraph/generatePdf?id=${id}&font=NOTOSANSKR_REGULAR&size=12`, true);
  xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
  xhr.responseType = 'blob';
  xhr.withCredentials = true;

  xhr.onload = function() {
    if (xhr.status === 200) {
      const url = window.URL.createObjectURL(xhr.response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `output_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      pdfBtn.disabled = false;
      pdfBtn.innerText = 'pdf 생성';
    } else {
      console.error('PDF 다운로드 실패:', xhr.statusText);
      alert('PDF 다운로드 실패. 다시 시도해 주세요.');
      pdfBtn.disabled = false;
      pdfBtn.innerText = 'pdf 생성';
    }
  };

  xhr.onerror = function() {
    console.error('PDF 요청 에러 발생');
    alert('PDF 요청 에러');
    pdfBtn.disabled = false;
    pdfBtn.innerText = 'pdf 생성';
  };

  xhr.send();
});



// 삭제 버튼 핸들러
const deleteBtn = document.querySelector('.delete-paragraph');

deleteBtn.addEventListener('click', () => {
  const id = modalContainer.getAttribute('data-id');

  if (!confirm('정말 삭제하시겠습니까? \n 내용은 저장되지 않으며, 되돌릴 수 없습니다. ')) return;

  apiRequest(`/api/paragraph?id=${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    alert('삭제가 완료되었습니다.');
    closeDetailModal(); // 모달 닫기
    loadParagraphs();   // 리스트 리로드
  })
  .catch(() => {
    alert('삭제 실패');
  });
});

