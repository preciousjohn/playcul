import cv2
import mediapipe as mp
import csv
import os

mp_hands = mp.solutions.hands

def extract_landmarks(video_path, label, output_csv):
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7
    )

    cap = cv2.VideoCapture(video_path)
    rows = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % 3 != 0:
            continue

        results = hands.process(
            cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        )

        if results.multi_hand_landmarks:
            row = []
            for lm in results.multi_hand_landmarks[0].landmark:
                row.extend([lm.x, lm.y, lm.z])
            row.append(label)
            rows.append(row)

    cap.release()
    hands.close()

    with open(output_csv, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    print(f"{label}: {len(rows)} frames extracted")

videos = [
    ('videos/c_chord.mp4', 'C_major'),
    ('videos/g_chord.mp4', 'G_major'),
    ('videos/f_chord.mp4', 'F_major'),
    ('videos/am_chord.mp4', 'Am_minor'),
    ('videos/a_chord.mp4', 'A_major'),
    ('videos/dm_chord.mp4', 'Dm_minor'),
    ('videos/d_chord.mp4', 'D_major'),
    ('videos/csharp_chord.mp4', 'Csharp_major'),
]

for video_path, label in videos:
    if os.path.exists(video_path):
        extract_landmarks(video_path, label, 'data/dataset.csv')
    else:
        print(f"Missing: {video_path}")
