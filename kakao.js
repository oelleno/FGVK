import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

function updatePreview() {
  const customerName = document.getElementById('customerName').value;
  const productName = window.getFormattedProductName();
  const deliveryDate = document.getElementById('deliveryDate').value;
  const formattedDate = deliveryDate ? new Date(deliveryDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const previewText = `'핏걸비키' 주문완료 안내
${customerName}님의 반짝이는 무대를 책임질 주문이 접수되었습니다(뽀뽀)

■ 주문상품: ${productName}
■ 배송예정일: ${formattedDate}

신속히 발송해드릴 예정입니다.
배송이 시작되면 다시 안내드릴게요! 

문의사항 있으시면 언제든지 연락주세요. 
감사합니다!(하트)`;

  document.getElementById('preview').textContent = previewText;
}

// Update preview when inputs change
['customerName', 'earrings', 'deliveryDate'].forEach(id => {
  document.getElementById(id).addEventListener('change', updatePreview);
  document.getElementById(id).addEventListener('input', updatePreview);
});

// Add event listeners for all checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', updatePreview);
});

async function sendKakaoMessage() {
  const db = window.db;
  const docId = window.docId;
  const customerName = document.getElementById('customerName').value;
  const phone = document.getElementById('phone').value;
  const productName = window.getFormattedProductName();
  const deliveryDate = document.getElementById('deliveryDate').value;
  const formattedDate = new Date(deliveryDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'apikey': 'hqupt87di966drllinn2l96kb02hixeq',
      'userid': 'fitgirlviki',
      'senderkey': 'bf70d26201780aa1e02231f2b45c00a7f6421bbc',
      'tpl_code': 'TZ_2885',
      'sender': '01086871992',
      'receiver_1': phone,
      'subject_1': '주문완료안내',
      'message_1': `'핏걸비키' 주문완료 안내
${customerName}님의 반짝이는 무대를 책임질 주문이 접수되었습니다(뽀뽀)

■ 주문상품: ${window.getFormattedProductName()}
■ 배송예정일: ${formattedDate}

신속히 발송해드릴 예정입니다.
배송이 시작되면 다시 안내드릴게요! 

문의사항 있으시면 언제든지 연락주세요. 
감사합니다!(하트)

`,
      'button_1': `{
        "button": [
          {
            "name": "채널추가",
            "linkType": "AC",
            "linkTypeName": "채널 추가"
          },
          {
            "name": "핏걸비키 바로가기",
            "linkType": "WL",
            "linkTypeName": "웹링크",
            "linkPc": "https://m.smartstore.naver.com/fitgirlviki",
            "linkMo": "https://m.smartstore.naver.com/fitgirlviki"
          },
          {
            "name": "상담톡 바로가기",
            "linkType": "WL",
            "linkTypeName": "웹링크",
            "linkPc": "https://pf.kakao.com/_xgxfixbn/chat",
            "linkMo": "https://pf.kakao.com/_xgxfixbn/chat"
          }
        ]
      }`,
      'failover': 'N'
    })
  });

  const data = await response.json();
  if (data.code === 0) {
    // Update Firestore with the current timestamp
    const earringSelect = document.getElementById('earrings');
    const selectedOption = earringSelect.options[earringSelect.selectedIndex].text;
    const docRef = doc(db, selectedOption, docId);
    await updateDoc(docRef, {
      "10_알림톡.1_주문완료안내": new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\. /g, '-').replace('.', '')
    });

    window.dispatchEvent(new Event('kakaoSendSuccess'));
    // Disable kakao button after successful send
    const kakaoButton = document.getElementById('sendKakao');
    kakaoButton.disabled = true;
    kakaoButton.textContent = '발송 완료';
    kakaoButton.style.backgroundColor = '#cccccc';
    kakaoButton.style.color = '#666666';
  } else {
    throw new Error(data.message);
  }
}

document.getElementById('sendKakao').addEventListener('click', () => {
  sendKakaoMessage().catch(error => {
    console.error('알림톡 발송 오류:', error);
    alert('알림톡 발송에 실패했습니다. 다시 시도해주세요.');
  });
});