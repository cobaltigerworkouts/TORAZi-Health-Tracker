import React, { useState } from 'react';

// 設定済みの GAS Web アプリ URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbwBFzOf2yYnHuOLAft2YMNDKBIn0wpQD1dg1bk1G6UTvuk3q28HtPmgav4ByMLepNwKEA/exec";

// Google スプレッドシートへのデータ送信処理
const sendToGoogleSheets = async (category, payload) => {
  if (!GAS_URL) return;
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        payload: payload,
      }),
    });
    console.log('スプレッドシートへの送信完了');
  } catch (error) {
    console.error('スプレッドシート送信エラー:', error);
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('training');
  const [logs, setLogs] = useState([]);
  
  // フォームデータ
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercise, setExercise] = useState('ベンチプレス');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [memo, setMemo] = useState('');

  // コンディショニング チェックリスト
  const [checks, setChecks] = useState({});

  const conditioningItems = [
    'ストレッチポール', '肩甲骨下制(ポール)', '肩甲骨ストレッチ(ポール)', '腰捻り胸開き',
    '股関節回し', '脇腹と股関節のストレッチ', 'ABS PUSH 15回×3set', 'ヒップリフト 10回×3set',
    '股関節ストレッチ(ポール)', '股割ストレッチ', '肩甲骨リリース', 'Cat and Dog',
    'HIP MOBILITY 40回×1set', '四つ這い体幹トレーニング 20回×1set', 'プランク 45秒×3set', 'カーフレイズ 15回×3set'
  ];

  const toggleCheck = (item) => {
    setChecks(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // その他の種目を記録
  const handleSingleRecord = (e) => {
    e.preventDefault();
    if (!exercise) return;

    const payload = {
      createdAt: new Date().toISOString(),
      date,
      exercise,
      weight: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps, 10) : null,
      sets: sets ? parseInt(sets, 10) : null,
      memo
    };

    setLogs(prev => [payload, ...prev]);
    sendToGoogleSheets('training', payload);

    setWeight('');
    setReps('');
    setSets('');
    setMemo('');
  };

  // まとめて記録する (TORAZi 種目メニュー & コンディショニング)
  const handleBatchRecord = (type) => {
    const completedConditioning = Object.keys(checks).filter(k => checks[k]);
    
    const payload = {
      createdAt: new Date().toISOString(),
      date,
      menuType: type || 'TORAZi Bulk Record',
      completedConditioning: completedConditioning.join(', '),
      memo: 'まとめて記録'
    };

    setLogs(prev => [payload, ...prev]);
    sendToGoogleSheets('training', payload);

    alert(`${type ? type + ' ' : ''}記録を送信しました！`);
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', color: '#8b949e', marginBottom: '10px' }}>VITALS LOG</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['training', 'intakes', 'metrics', 'overview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #30363d',
                backgroundColor: activeTab === tab ? '#2ea043' : '#21262d',
                color: '#fff',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'training' ? 'Training' : tab === 'intakes' ? 'Intakes' : tab === 'metrics' ? 'Metrics' : 'Overview'}
            </button>
          ))}
        </div>
      </header>

      {/* Training タブ */}
      {activeTab === 'training' && (
        <main>
          <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>Training</h2>
          <p style={{ fontSize: '12px', color: '#8b949e', marginBottom: '20px' }}>
            食事・サプリ・薬・運動・体重・血液検査・健診・体組成をまとめて記録します
          </p>

          {/* コンディショニング */}
          <section style={{ backgroundColor: '#161b22', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '16px', color: '#3fb950', marginBottom: '8px' }}>コンディショニング</h3>
            <p style={{ fontSize: '12px', color: '#8b949e', marginBottom: '12px' }}>
              重量は関係なし。やったものだけタップしてチェックしてください。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {conditioningItems.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleCheck(item)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #30363d',
                    backgroundColor: checks[item] ? '#238636' : '#21262d',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {checks[item] ? '✓ ' : '☐ '}{item}
                </button>
              ))}
            </div>
          </section>

          {/* TORAZi 種目メニュー */}
          <section style={{ backgroundColor: '#161b22', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '16px', color: '#ffffff', fontWeight: 'bold', marginBottom: '12px' }}>TORAZi 種目メニュー</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['胸', '背', '脚', '尻', '整'].map((menu) => (
                <button
                  key={menu}
                  onClick={() => handleBatchRecord(`虎${menu}`)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #30363d',
                    backgroundColor: '#21262d',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {menu}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleBatchRecord()}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2ea043',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ＋ まとめて記録する
            </button>
          </section>

          {/* その他の種目を記録 */}
          <section style={{ backgroundColor: '#161b22', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>その他の種目を記録</h3>
            <p style={{ fontSize: '12px', color: '#8b949e', marginBottom: '12px' }}>マスターにない種目はこちらから自由に記録できます。</p>
            <form onSubmit={handleSingleRecord} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: '0 0 130px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>日付</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff', fontSize: '12px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>種目名</label>
                  <input
                    type="text"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>重量 (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>回数 (reps)</label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>セット数</label>
                  <input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>メモ</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="調子・フォームなど"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#238636',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                記録する
              </button>
            </form>
          </section>

          {/* ログ一覧 */}
          <section style={{ backgroundColor: '#161b22', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>ログ</h3>
            {logs.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#8b949e' }}>まだ記録がありません。上のフォームから最初のセットを記録しましょう。</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {logs.map((log, idx) => (
                  <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #30363d', fontSize: '13px' }}>
                    <strong>{log.date}</strong> - {log.exercise || log.menuType}
                    {log.weight && ` | ${log.weight}kg`}
                    {log.reps && ` x ${log.reps}reps`}
                    {log.sets && ` (${log.sets}sets)`}
                    {log.completedConditioning && ` | コンディショニング: ${log.completedConditioning}`}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}

      {/* その他のタブ（Intakes, Metrics, Overview） */}
      {activeTab !== 'training' && (
        <div style={{ backgroundColor: '#161b22', padding: '40px 20px', borderRadius: '8px', textAlign: 'center', color: '#8b949e', border: '1px solid #30363d', marginTop: '20px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '8px', textTransform: 'uppercase' }}>{activeTab}</h2>
          <p style={{ fontSize: '14px' }}>この画面は現在準備中です。</p>
        </div>
      )}
    </div>
  );
}
