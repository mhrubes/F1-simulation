import type { TrackDef } from "@/lib/types";

/** SVG path musí odpovídat souborům v /public/generated/tracks */
export const TRACKS: TrackDef[] = [
  {
    id: "monza",
    nameKey: "tracks.monza",
    lapTimeSeconds: 79,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/monza.svg",
    pathD:
      "M 802 325 L 815 373 L 802 423 L 761 468 L 696 501 L 619 518 L 538 518 L 465 504 L 404 482 L 353 457 L 308 430 L 266 401 L 228 367 L 198 325 L 185 277 L 198 227 L 239 182 L 304 149 L 381 132 L 462 132 L 535 146 L 596 168 L 647 193 L 692 220 L 734 249 L 772 283 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5793,
  },
  {
    id: "spa",
    nameKey: "tracks.spa",
    lapTimeSeconds: 106,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/spa.svg",
    pathD:
      "M 55 430 L 82 342 L 138 288 L 215 268 L 285 292 L 332 252 L 398 218 L 478 202 L 558 218 L 625 198 L 702 212 L 775 258 L 825 322 L 858 395 L 875 455 L 832 518 L 758 548 L 675 538 L 602 512 L 528 522 L 448 538 L 365 528 L 285 512 L 205 495 L 125 468 L 55 430 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 7004,
  },
  {
    id: "silverstone",
    nameKey: "tracks.silverstone",
    lapTimeSeconds: 88,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/silverstone.svg",
    pathD:
      "M 95 125 L 220 98 L 345 115 L 465 95 L 580 118 L 688 168 L 765 235 L 815 318 L 798 412 L 732 485 L 638 528 L 535 515 L 442 532 L 338 512 L 248 468 L 178 388 L 128 285 L 95 195 L 95 125 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5891,
  },
  {
    id: "monaco",
    nameKey: "tracks.monaco",
    lapTimeSeconds: 74,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/monaco.svg",
    pathD:
      "M 148 512 L 132 442 L 158 382 L 215 348 L 255 308 L 242 268 L 285 235 L 345 218 L 415 228 L 492 215 L 565 198 L 638 215 L 702 258 L 742 318 L 755 368 L 732 422 L 678 468 L 612 492 L 532 488 L 455 505 L 378 522 L 298 515 L 218 518 L 165 522 L 148 512 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 3337,
  },
  {
    id: "suzuka",
    nameKey: "tracks.suzuka",
    lapTimeSeconds: 92,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/suzuka.svg",
    pathD:
      "M 765 325 L 798 377 L 777 428 L 708 455 L 631 459 L 576 467 L 529 494 L 465 527 L 388 533 L 330 499 L 311 443 L 307 396 L 283 363 L 235 325 L 202 273 L 223 222 L 292 195 L 369 191 L 424 183 L 471 156 L 535 123 L 612 117 L 670 151 L 689 207 L 693 254 L 717 287 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5807,
  },
  {
    id: "bahrain",
    nameKey: "tracks.bahrain",
    lapTimeSeconds: 88,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/bahrain.svg",
    pathD:
      "M 899 377 L 882 440 L 814 491 L 715 518 L 612 524 L 521 522 L 432 523 L 335 522 L 230 507 L 144 467 L 102 407 L 112 344 L 154 289 L 202 244 L 245 200 L 295 151 L 371 107 L 474 83 L 583 92 L 673 128 L 734 177 L 777 224 L 823 267 L 870 317 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5412,
  },
  {
    id: "catalunya",
    nameKey: "tracks.catalunya",
    lapTimeSeconds: 77,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/catalunya.svg",
    pathD:
      "M 683 570 L 570 579 L 465 561 L 379 528 L 309 488 L 248 446 L 191 397 L 145 335 L 126 262 L 148 185 L 215 120 L 317 80 L 430 71 L 535 89 L 621 122 L 691 162 L 752 204 L 809 253 L 855 315 L 874 388 L 852 465 L 785 530 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 4657,
  },
  {
    id: "cota",
    nameKey: "tracks.cota",
    lapTimeSeconds: 95,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/cota.svg",
    pathD:
      "M 539 521 L 450 521 L 354 522 L 248 511 L 153 476 L 99 417 L 98 351 L 137 292 L 187 243 L 231 198 L 277 148 L 347 99 L 446 68 L 559 70 L 656 103 L 723 152 L 768 202 L 813 247 L 863 296 L 900 356 L 895 422 L 837 479 L 740 513 L 634 522 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5513,
  },
  {
    id: "hungaroring",
    nameKey: "tracks.hungaroring",
    lapTimeSeconds: 79,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/hungaroring.svg",
    pathD:
      "M 667 480 L 602 489 L 547 506 L 483 552 L 394 576 L 316 548 L 288 482 L 290 422 L 266 384 L 219 345 L 160 290 L 162 227 L 236 189 L 333 184 L 398 175 L 453 158 L 517 112 L 606 88 L 684 116 L 712 182 L 710 242 L 734 280 L 781 319 L 840 374 L 838 437 L 764 475 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 4387,
  },
  {
    id: "jeddah",
    nameKey: "tracks.jeddah",
    lapTimeSeconds: 87,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/jeddah.svg",
    pathD:
      "M 861 428 L 776 452 L 704 474 L 638 505 L 554 532 L 455 534 L 369 509 L 303 477 L 232 454 L 147 431 L 82 394 L 73 346 L 109 301 L 145 261 L 162 219 L 190 172 L 260 138 L 358 129 L 453 135 L 538 136 L 632 130 L 731 136 L 805 168 L 837 214 L 853 258 L 887 297 L 925 341 L 922 389 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 6174,
  },
  {
    id: "miami",
    nameKey: "tracks.miami",
    lapTimeSeconds: 89,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/miami.svg",
    pathD:
      "M 339 551 L 268 507 L 233 451 L 210 401 L 172 355 L 130 302 L 120 241 L 166 187 L 251 155 L 339 139 L 413 121 L 490 94 L 584 75 L 681 85 L 752 129 L 787 185 L 810 235 L 848 281 L 890 334 L 900 395 L 854 449 L 769 481 L 681 497 L 607 515 L 530 542 L 436 561 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5412,
  },
  {
    id: "singapore",
    nameKey: "tracks.singapore",
    lapTimeSeconds: 102,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/singapore.svg",
    pathD:
      "M 843 432 L 767 462 L 686 471 L 638 493 L 603 543 L 545 593 L 468 598 L 405 554 L 368 500 L 325 473 L 249 464 L 167 439 L 137 387 L 175 330 L 232 287 L 254 249 L 242 193 L 249 128 L 308 91 L 394 99 L 466 126 L 523 129 L 592 104 L 678 89 L 744 118 L 760 181 L 747 240 L 760 281 L 814 321 L 861 376 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5063,
  },
  {
    id: "vegas",
    nameKey: "tracks.vegas",
    lapTimeSeconds: 93,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/vegas.svg",
    pathD:
      "M 811 460 L 698 480 L 596 500 L 485 522 L 356 526 L 246 495 L 185 443 L 147 393 L 98 345 L 62 288 L 92 230 L 189 190 L 302 170 L 404 150 L 515 128 L 644 124 L 754 155 L 815 207 L 853 257 L 902 305 L 938 362 L 908 420 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 6120,
  },
  {
    id: "zandvoort",
    nameKey: "tracks.zandvoort",
    lapTimeSeconds: 73,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/zandvoort.svg",
    pathD:
      "M 844 341 L 866 425 L 820 502 L 720 544 L 611 547 L 521 537 L 440 540 L 342 549 L 231 534 L 146 478 L 125 395 L 165 316 L 223 257 L 267 205 L 301 142 L 360 73 L 458 30 L 570 40 L 655 96 L 702 166 L 737 224 L 786 276 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 4259,
  },
  {
    id: "portello",
    nameKey: "tracks.portello",
    lapTimeSeconds: 72,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/portello.svg",
    pathD:
      "M 502 548 L 595 528 L 658 472 L 692 398 L 718 312 L 698 232 L 628 178 L 538 162 L 448 188 L 382 242 L 328 298 L 268 338 L 198 348 L 145 382 L 118 448 L 135 508 L 202 542 L 285 538 L 352 502 L 398 448 L 445 412 L 505 418 L 548 462 L 542 520 L 502 548 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 4309,
  },
  {
    id: "ridgeway",
    nameKey: "tracks.ridgeway",
    lapTimeSeconds: 94,
    previewSpeedFactor: 10,
    imageSrc: "/generated/tracks/ridgeway.svg",
    pathD:
      "M 95 515 L 720 515 L 798 478 L 832 418 L 818 352 L 765 298 L 688 268 L 615 285 L 552 318 L 505 365 L 458 328 L 385 248 L 318 198 L 248 188 L 185 218 L 138 278 L 108 352 L 95 428 L 95 515 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5480,
  },
];

export function getTrack(id: string | null): TrackDef | undefined {
  if (!id) return undefined;
  return TRACKS.find((t) => t.id === id);
}
