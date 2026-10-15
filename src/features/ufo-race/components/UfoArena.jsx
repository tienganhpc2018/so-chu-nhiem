import React, { useState, useEffect, useRef } from 'react';
import { UfoCityBackground } from './UfoCityBackground';
import { UfoSaucer } from './UfoSaucer';
import { UfoStudentSprite } from './UfoStudentSprite';
import { UFO_SPEECH_QUOTES } from '../data/defaultUfoData';
import { ufoAudio } from '../utils/ufoAudio';

export const UfoArena = ({
  students = [],
  pickCount = 2,
  isRunning = false,
  onCompleteCapture,
  calledStudentIds = []
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 700 });
  const [studentSprites, setStudentSprites] = useState([]);
  const [capturedCount, setCapturedCount] = useState(0);
  const [targetStudentPos, setTargetStudentPos] = useState(null);
  const [isBeaming, setIsBeaming] = useState(false);

  const animFrameRef = useRef(null);
  const captureQueueRef = useRef([]);
  const currentTargetIdxRef = useRef(0);
  const isRunningRef = useRef(isRunning);

  isRunningRef.current = isRunning;

  // Lấy kích thước container responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 700
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Khởi tạo vị trí & chuyển động ngẫu nhiên của các học sinh trên phố
  useEffect(() => {
    if (!students || students.length === 0) return;

    const width = containerSize.width || 1200;
    const height = containerSize.height || 700;
    const roadY = height * 0.84; // Vị trí mặt đường

    const sprites = students.map((std, idx) => {
      const x = 80 + ((idx * 27) % (width - 160));
      const vx = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.5);
      return {
        student: std,
        x,
        y: roadY + (Math.random() * 25 - 12),
        baseY: roadY,
        vx,
        vy: 0,
        isTargeted: false,
        isAbducted: false,
        speechQuote: null,
        gender: idx % 2 === 0 ? 'male' : 'female',
        rotation: 0
      };
    });

    setStudentSprites(sprites);
    setCapturedCount(0);
    setTargetStudentPos(null);
    setIsBeaming(false);
  }, [students, containerSize.width, containerSize.height]);

  // Luồng bong bóng thoại học đường xuất hiện ngẫu nhiên
  useEffect(() => {
    const speechTimer = setInterval(() => {
      if (isRunningRef.current) return;
      setStudentSprites(prev => {
        if (prev.length === 0) return prev;
        const randomIdx = Math.floor(Math.random() * prev.length);
        const randomQuote = UFO_SPEECH_QUOTES[Math.floor(Math.random() * UFO_SPEECH_QUOTES.length)];

        return prev.map((s, idx) => {
          if (idx === randomIdx) {
            return { ...s, speechQuote: randomQuote };
          }
          return s.speechQuote ? { ...s, speechQuote: null } : s;
        });
      });
    }, 4500);

    return () => clearInterval(speechTimer);
  }, []);

  // Vòng lặp vật lý & chuyển động Animation
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      setStudentSprites(prev => {
        const width = containerSize.width || 1200;

        return prev.map(item => {
          if (item.isAbducted) return item;

          let newX = item.x + item.vx * (isRunningRef.current ? 70 : 45) * dt;
          let newVx = item.vx;

          // Chạm mép phố thì quay đầu
          if (newX < 60) {
            newX = 60;
            newVx = Math.abs(newVx);
          } else if (newX > width - 60) {
            newX = width - 60;
            newVx = -Math.abs(newVx);
          }

          // Nhấp nhô bước chạy nhẹ
          const bounce = Math.sin(currentTime * 0.008 + item.x) * 3;

          return {
            ...item,
            x: newX,
            y: item.baseY + bounce,
            vx: newVx
          };
        });
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [containerSize.width]);

  // Kịch bản khi nhấn "Bắt đầu": Quét radar, ngắm mục tiêu và hút học sinh lên đĩa bay
  useEffect(() => {
    if (!isRunning) {
      setIsBeaming(false);
      setTargetStudentPos(null);
      return;
    }

    // Chọn danh sách học sinh sẽ bị bắt trong lượt này
    const availableStudents = studentSprites.filter(s => !s.isAbducted);
    if (availableStudents.length === 0) return;

    // Lọc ưu tiên những bạn chưa được gọi
    let uncalled = availableStudents.filter(s => !calledStudentIds.includes(s.student.id));
    if (uncalled.length < pickCount) {
      uncalled = [...availableStudents];
    }

    // Xáo trộn ngẫu nhiên
    const shuffled = [...uncalled].sort(() => Math.random() - 0.5);
    const toCapture = shuffled.slice(0, Math.min(pickCount, shuffled.length));

    captureQueueRef.current = toCapture;
    currentTargetIdxRef.current = 0;
    setCapturedCount(0);
    setIsBeaming(true);

    ufoAudio.playTractorBeam();

    // Bắt từng bạn một theo trình tự kịch tính
    const abductNextStudent = () => {
      const queue = captureQueueRef.current;
      const currentIdx = currentTargetIdxRef.current;

      if (currentIdx >= queue.length) {
        // Hoàn thành bắt đủ số lượng yêu cầu!
        setIsBeaming(false);
        setTargetStudentPos(null);
        ufoAudio.playVictory();
        setTimeout(() => {
          onCompleteCapture?.(queue.map(q => q.student));
        }, 800);
        return;
      }

      const targetItem = queue[currentIdx];
      // 1. Khóa mục tiêu (Lock-on)
      setTargetStudentPos({ x: targetItem.x, y: targetItem.y });
      ufoAudio.playLockOn();

      setStudentSprites(prev =>
        prev.map(s => (s.student.id === targetItem.student.id ? { ...s, isTargeted: true } : s))
      );

      // 2. Sau 1.2 giây: Kích hoạt lực hút phản trọng lực bay lên đĩa bay
      setTimeout(() => {
        ufoAudio.playAbductWhoosh();
        setStudentSprites(prev =>
          prev.map(s => {
            if (s.student.id === targetItem.student.id) {
              return {
                ...s,
                isTargeted: false,
                isAbducted: true,
                x: containerSize.width / 2 + (Math.random() * 40 - 20),
                y: 110, // Vị trí cửa đáy đĩa bay
                rotation: 180 + Math.random() * 90 // Lộn nhào hài hước
              };
            }
            return s;
          })
        );

        setCapturedCount(currentIdx + 1);
        currentTargetIdxRef.current = currentIdx + 1;

        // Tiếp tục bạn tiếp theo sau 1.4s
        setTimeout(abductNextStudent, 1400);
      }, 1200);
    };

    const startTimer = setTimeout(abductNextStudent, 800);
    return () => clearTimeout(startTimer);
  }, [isRunning, pickCount]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#0a1128]"
    >
      {/* 1. Thành phố & Bầu trời đêm */}
      <UfoCityBackground />

      {/* 2. Đĩa bay UFO kim loại với bảng đếm số và đèn LED */}
      <UfoSaucer
        capturedCount={capturedCount}
        targetCount={pickCount}
        isBeaming={isBeaming}
        targetStudentPos={targetStudentPos}
        containerWidth={containerSize.width}
      />

      {/* 3. Toàn bộ các học sinh đang chạy nhảy hoặc bị hút trên phố */}
      {studentSprites.map(item => (
        <UfoStudentSprite
          key={item.student.id}
          student={item.student}
          x={item.x}
          y={item.y}
          vx={item.vx}
          isTargeted={item.isTargeted}
          isAbducted={item.isAbducted}
          speechQuote={item.speechQuote}
          gender={item.gender}
          rotation={item.rotation}
        />
      ))}
    </div>
  );
};
