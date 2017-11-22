
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

let GameDungeon;
//var GameDungeon = makeDungeon(DefaultDungeonConfiguration()); GraphiqueDungeon(GameDungeon);
GraphiqueDungeon(makeDungeon(DefaultDungeonConfiguration()));
//var ejemplo = testAlgorithm(400);

function DefaultDungeonConfiguration() {
    return GameDungeon =
        {
            DungeonBlocks: [],
            DungeonRooms: [],
            DungeonHeight: 30,
            DungeonWidth: 30,
            TotalBloquesDungeon: 500,
            DungeonRoomsWidthMin: 3,
            DungeonRoomsWidthMax: 6,
            DungeonRoomsHeightMin: 3,
            DungeonRoomsHeightMax: 6,
            DungeonRoomsSizeAmbivalence: 0,
            DungeonMode: "PLATFORM",
            LabyrinthInn: 1,
            StartPointX: 0,
            StartPointY: 0,
            Status: "NOT",
        }
}

function DungeonBasicConfiguration(Width, Height, Blocks) {
    return GameDungeon =
        {
            DungeonBlocks: [],
            DungeonRooms: [],
            DungeonHeight: Width,
            DungeonWidth: Height,
            TotalBloquesDungeon: Blocks,
            DungeonRoomsWidthMin: 2,
            DungeonRoomsWidthMax: 5,
            DungeonRoomsHeightMin: 2,
            DungeonRoomsHeightMax: 5,
            DungeonRoomsSizeAmbivalence: 0,
            DungeonMode: "PLATFORM",
            LabyrinthInn: 1,
            StartPointX: 0,
            StartPointY: 0,
        }
}

function testAlgorithm(ciclos) {
    for (let xxx = 0; xxx < ciclos; xxx++) {
        var t0 = performance.now();
        var ss = makeDungeon(DefaultDungeonConfiguration());
        var t1 = performance.now();
        console.log(xxx + " Array took " + (t1 - t0) + " milliseconds.");
    }
    return 0;
}

function makeDungeon(GameDungeon) {
    GameDungeon.TotalBloquesDungeon = (GameDungeon.DungeonWidth * GameDungeon.DungeonHeight) <= GameDungeon.TotalBloquesDungeon ? (GameDungeon.DungeonWidth * GameDungeon.DungeonHeight) : GameDungeon.TotalBloquesDungeon;
    for (let l = 0; l < GameDungeon.DungeonHeight; l++) {
        GameDungeon.DungeonBlocks[l] = [];
        for (let m = 0; m < GameDungeon.DungeonWidth; m++) {
            GameDungeon.DungeonBlocks[l][m] =
                {
                    Id: 0,
                    X: m, Y: l,
                    RoomX: m, RoomY: l,
                    Room: 0,
                    WallTop: 0, WallRight: 0, WallBottom: 0, WallLeft: 0,
                    RoomWallTop: 0, RoomWallRight: 0, RoomWallBottom: 0, RoomWallLeft: 0,
                    ConnectTop: 0, ConnectRight: 0, ConnectBottom: 0, ConnectLeft: 0,
                    Status: "OK",
                };
        }
    }
    GameDungeon = MakeDungeonShape(GameDungeon);
    GameDungeon = MakeDungeonRoomShape(GameDungeon);
    GameDungeon = MakeDungeonRoomConnections(GameDungeon);
    GameDungeon = (GameDungeon.LabyrinthInn == 1) ? MakeDungeonRoomInner(GameDungeon) : GameDungeon;
    GameDungeon.Status = "LOADED";
    return GameDungeon;
}

function MakeDungeonShape(GameDungeon) {
    var CuadrosDisponibles = [];
    var DungeonArray = GameDungeon.DungeonBlocks;

    var StartX = Math.floor(GameDungeon.DungeonWidth / 2);
    var StartY = Math.floor(GameDungeon.DungeonHeight / 2);
    StartX = (GameDungeon.StartPointX < 0) ? 0 : StartX;
    StartX = (GameDungeon.StartPointX > 0) ? (GameDungeon.DungeonWidth - 1) : StartX;
    StartY = (GameDungeon.StartPointY < 0) ? 0 : StartY;
    StartY = (GameDungeon.StartPointY > 0) ? (GameDungeon.DungeonHeight - 1) : StartY;

    CuadrosDisponibles[CuadrosDisponibles.length] = ([StartY, StartX]);
    for (let l = 1; l <= GameDungeon.TotalBloquesDungeon; l++) {
        var comprobado = 0;
        while (comprobado == 0) {
            var randomNumber = Math.floor((Math.random() * CuadrosDisponibles.length));
            //randomNumber =  (CuadrosDisponibles.length >= 10) ? Math.floor((Math.random() * 5) + 5) : randomNumber;
            randomNumber = Math.floor((Math.random() * 2)) == 1 ? (CuadrosDisponibles.length - 1) - randomNumber : randomNumber;
            var CuadroSeleccionado = CuadrosDisponibles[randomNumber];
            var CuadroSeleccionadoY = CuadroSeleccionado[0];
            var CuadroSeleccionadoX = CuadroSeleccionado[1];
            if (DungeonArray[CuadroSeleccionadoY][CuadroSeleccionadoX].Id == 0) {
                DungeonArray[CuadroSeleccionadoY][CuadroSeleccionadoX].Id = l;
                comprobado = 1;
            }
            CuadrosDisponibles.splice(randomNumber, 1);
        }
        if ((CuadroSeleccionadoX - 1) >= 0 && DungeonArray[CuadroSeleccionadoY][CuadroSeleccionadoX - 1].Id == 0) {
            CuadrosDisponibles.push([CuadroSeleccionadoY, CuadroSeleccionadoX - 1]);
        }
        if ((CuadroSeleccionadoX + 1) < GameDungeon.DungeonWidth && DungeonArray[CuadroSeleccionadoY][CuadroSeleccionadoX + 1].Id == 0) {
            CuadrosDisponibles.push([CuadroSeleccionadoY, CuadroSeleccionadoX + 1]);
        }
        if ((CuadroSeleccionadoY - 1) >= 0 && DungeonArray[CuadroSeleccionadoY - 1][CuadroSeleccionadoX].Id == 0) {
            CuadrosDisponibles.push([CuadroSeleccionadoY - 1, CuadroSeleccionadoX]);
        }
        if ((CuadroSeleccionadoY + 1) < GameDungeon.DungeonHeight && DungeonArray[CuadroSeleccionadoY + 1][CuadroSeleccionadoX].Id == 0) {
            CuadrosDisponibles.push([CuadroSeleccionadoY + 1, CuadroSeleccionadoX]);
        }
    }

    for (let l = 0; l < GameDungeon.DungeonHeight; l++) {
        for (let m = 0; m < GameDungeon.DungeonWidth; m++) {
            if (DungeonArray[l][m].Id > 0) {
                DungeonArray[l][m].WallTop = ((l - 1) < 0) ? 1 : (DungeonArray[l - 1][m].Id == 0) ? 1 : 0;
                DungeonArray[l][m].WallBottom = ((l + 1) >= GameDungeon.DungeonHeight) ? 1 : (DungeonArray[l + 1][m].Id == 0) ? 1 : 0;
                DungeonArray[l][m].WallLeft = ((m - 1) < 0) ? 1 : (DungeonArray[l][m - 1].Id == 0) ? 1 : 0;
                DungeonArray[l][m].WallRight = ((m + 1) >= GameDungeon.DungeonWidth) ? 1 : (DungeonArray[l][m + 1].Id == 0) ? 1 : 0;
            } else {
                DungeonArray[l][m].Status = "VOID";
            }
        }
    }
    return GameDungeon;
}

function MakeDungeonRoomShape(GameDungeon) {
    var DungeonArray = GameDungeon.DungeonBlocks;
    var DungeonRooms = GameDungeon.DungeonRooms;

    for (l = 0; l < GameDungeon.DungeonHeight; l++) {
        for (m = 0; m < GameDungeon.DungeonWidth; m++) {
            if (DungeonArray[l][m].Id > 0) {
                DungeonArray[l][m].Status = "NOT";
            }
        }
    }

    for (let y = 0; y < GameDungeon.DungeonHeight; y++) {
        for (let x = 0; x < GameDungeon.DungeonWidth; x++) {
            if (DungeonArray[y][x].Status == "NOT") {
                var randomWidth = Math.floor((Math.random() * ((GameDungeon.DungeonRoomsWidthMax + 1) - GameDungeon.DungeonRoomsWidthMin)) + GameDungeon.DungeonRoomsWidthMin);
                var randomHeight = Math.floor((Math.random() * ((GameDungeon.DungeonRoomsHeightMax + 1) - GameDungeon.DungeonRoomsHeightMin)) + GameDungeon.DungeonRoomsHeightMin);
                randomHeight = GameDungeon.DungeonRoomsSizeAmbivalence == 1 ? randomWidth : randomHeight;
                var encontradoX = x;
                var encontradoY = y;
                var l = 0;
                var m = 0;
                var EspacioDisponible = true;
                var retroceso = 0;
                var newRoom =
                    {
                        Id: DungeonRooms.length + 1,
                        index: DungeonRooms.length,
                        Blocks: []
                    };
                for (let yl = 0; yl < randomHeight; yl++) {
                    newRoom.Blocks[yl] = [];
                    for (let xm = 0; xm < randomWidth; xm++) {
                        newRoom.Blocks[yl][xm] =
                            {
                                Block:
                                    {
                                        Id: 0,
                                        X: xm, Y: yl,
                                        RoomX: xm, RoomY: yl,
                                        Room: 0,
                                        WallTop: 0, WallRight: 0, WallBottom: 0, WallLeft: 0,
                                        RoomWallTop: 0, RoomWallRight: 0, RoomWallBottom: 0, RoomWallLeft: 0,
                                        ConnectTop: 0, ConnectRight: 0, ConnectBottom: 0, ConnectLeft: 0,
                                        Status: "NOT",
                                    },
                                RoomX: xm,
                                RoomY: yl
                            };
                    }
                }
                var BloquesLiberados = [];
                var BlockCursor = DungeonArray[encontradoY][encontradoX];
                BlockCursor.Status = "OK";
                BlockCursor.Room = newRoom.Id;
                BlockCursor.RoomY = l;
                BlockCursor.RoomX = m;
                BloquesLiberados[BloquesLiberados.length] = BlockCursor;
                newRoom.Blocks[l][m] =
                    {
                        Block: BlockCursor,
                        RoomX: m,
                        RoomY: l
                    };
                while (EspacioDisponible) {
                    var BloquesDisponibles = [];
                    var DireccionesDisponibles = [];
                    if (DungeonArray[(encontradoY + l)][(encontradoX + m) - 1] != null &&
                        DungeonArray[(encontradoY + l)][(encontradoX + m) - 1].Status != "OK" &&
                        DungeonArray[(encontradoY + l)][(encontradoX + m) - 1].Id > 0 && (m - 1) >= 0) {
                        BloquesDisponibles[BloquesDisponibles.length] = DungeonArray[(encontradoY + l)][(encontradoX + m) - 1];
                        DireccionesDisponibles[DireccionesDisponibles.length] = "LEFT";
                    }

                    if (DungeonArray[(encontradoY + l)][(encontradoX + m) + 1] != null &&
                        DungeonArray[(encontradoY + l)][(encontradoX + m) + 1].Status != "OK" &&
                        DungeonArray[(encontradoY + l)][(encontradoX + m) + 1].Id > 0 && (m + 1) < randomWidth) {
                        BloquesDisponibles[BloquesDisponibles.length] = DungeonArray[(encontradoY + l)][(encontradoX + m) + 1];
                        DireccionesDisponibles[DireccionesDisponibles.length] = "RIGHT";
                    }

                    if (DungeonArray[(encontradoY + l) - 1] != null && DungeonArray[(encontradoY + l) - 1][(encontradoX + m)] != null &&
                        DungeonArray[(encontradoY + l) - 1][(encontradoX + m)].Status != "OK" &&
                        DungeonArray[(encontradoY + l) - 1][(encontradoX + m)].Id > 0 && (l - 1) >= 0) {
                        BloquesDisponibles[BloquesDisponibles.length] = DungeonArray[(encontradoY + l) - 1][(encontradoX + m)];
                        DireccionesDisponibles[DireccionesDisponibles.length] = "TOP";
                    }

                    if (DungeonArray[(encontradoY + l) + 1] != null && DungeonArray[(encontradoY + l) + 1][(encontradoX + m)] != null &&
                        DungeonArray[(encontradoY + l) + 1][(encontradoX + m)].Status != "OK" &&
                        DungeonArray[(encontradoY + l) + 1][(encontradoX + m)].Id > 0 && (l + 1) < randomHeight) {
                        BloquesDisponibles[BloquesDisponibles.length] = DungeonArray[(encontradoY + l) + 1][(encontradoX + m)];
                        DireccionesDisponibles[DireccionesDisponibles.length] = "BOTTOM";
                    }
                    if (BloquesDisponibles.length > 0) {
                        var numseleccionado = Math.floor((Math.random() * BloquesDisponibles.length));
                        var nuevoBloque = BloquesDisponibles[numseleccionado];
                        switch (DireccionesDisponibles[numseleccionado]) {
                            case "LEFT": m--; break;
                            case "RIGHT": m++; break;
                            case "TOP": l--; break;
                            case "BOTTOM": l++; break;
                        }
                        BlockCursor = nuevoBloque;
                        BlockCursor.Status = "OK";
                        BlockCursor.Room = newRoom.Id;
                        BlockCursor.RoomY = l;
                        BlockCursor.RoomX = m;
                        BloquesLiberados[BloquesLiberados.length] = BlockCursor;
                        newRoom.Blocks[l][m] =
                            {
                                Block: BlockCursor,
                                RoomX: m,
                                RoomY: l
                            };
                        retroceso = 0;
                    } else {
                        retroceso++;
                        if (BloquesLiberados.length - retroceso < 0) {
                            EspacioDisponible = false;
                        }
                        else {
                            BlockCursor = BloquesLiberados[BloquesLiberados.length - retroceso];
                            l = BlockCursor.RoomY;
                            m = BlockCursor.RoomX;
                        }
                    }
                }
                DungeonRooms[DungeonRooms.length] = newRoom;
            }
        }
    }
    /*Dungeon Rooms, WALLS*/
    for (let r = 0; r < DungeonRooms.length; r++) {
        for (let b = 0; b < DungeonRooms[r].Blocks.length; b++) {
            for (let a = 0; a < DungeonRooms[r].Blocks[b].length; a++) {
                var DungeonRoomsBlocks = DungeonRooms[r].Blocks;
                var DungeonSelectedBlock = DungeonRoomsBlocks[b][a].Block;

                DungeonSelectedBlock.WallTop = (DungeonRoomsBlocks[b - 1] == null) ? 1 : (DungeonRoomsBlocks[b - 1][a] == null || DungeonRoomsBlocks[b - 1][a].Block.Id == 0) ? 1 : DungeonSelectedBlock.WallTop;
                DungeonSelectedBlock.WallLeft = (DungeonRoomsBlocks[b][a - 1] == null || DungeonRoomsBlocks[b][a - 1].Block.Id == 0) ? 1 : DungeonSelectedBlock.WallLeft;
                DungeonSelectedBlock.WallRight = (DungeonRoomsBlocks[b][a + 1] == null || DungeonRoomsBlocks[b][a + 1].Block.Id == 0) ? 1 : DungeonSelectedBlock.WallRight;
                DungeonSelectedBlock.WallBottom = (DungeonRoomsBlocks[b + 1] == null) ? 1 : (DungeonRoomsBlocks[b + 1][a] == null || DungeonRoomsBlocks[b + 1][a].Block.Id == 0) ? 1 : DungeonSelectedBlock.WallBottom;
            }
        }
    }
    return GameDungeon;
}

function MakeDungeonRoomConnections(GameDungeon) {
    var DungeonArray = GameDungeon.DungeonBlocks;
    var DungeonRooms = GameDungeon.DungeonRooms;
    var RoomVisited = [];
    RoomVisited[RoomVisited.length] =
        {
            Room: DungeonRooms[0],
            RoomAnterior: 0
        };
    var RoomVisitedActual = RoomVisited[0];
    while (RoomVisited.length < DungeonRooms.length) {
        var r = RoomVisitedActual.Room.index;
        var puertaColocada = 0;
        var cuartoCumplido = 0;
        var DungeonRoomSelected = DungeonRooms[r];
        var DungeonRoomBlocksLotery = [];
        for (let b = 0; b < DungeonRoomSelected.Blocks.length; b++) {
            for (let a = 0; a < DungeonRoomSelected.Blocks[b].length; a++) {
                if (DungeonRoomSelected.Blocks[b][a].Block.Id > 0) {
                    DungeonRoomBlocksLotery[DungeonRoomBlocksLotery.length] = DungeonRoomSelected.Blocks[b][a];
                }
            }
        }
        while (DungeonRoomBlocksLotery.length > 0 && puertaColocada == 0) {
            var randomNumber = Math.floor((Math.random() * DungeonRoomBlocksLotery.length));
            var randomConnection = Math.floor(Math.random() * 2);
            randomNumber = randomConnection == 1 ? 0 : randomNumber;
            randomNumber = randomConnection == 2 ? DungeonRoomBlocksLotery.length - 1 : randomNumber;
            var DungeonSelected = DungeonRoomBlocksLotery[randomNumber];
            DungeonRoomBlocksLotery.splice(randomNumber, 1);
            var DungeonBlockSelected = DungeonSelected.Block;

            if (DungeonBlockSelected.X > 0 && puertaColocada == 0) {
                var DungeonSelectedLeft = DungeonArray[DungeonBlockSelected.Y][DungeonBlockSelected.X - 1];
                if (DungeonSelectedLeft.Id > 0 && DungeonSelectedLeft.Room != DungeonRoomSelected.Id) {
                    puertaColocada = DungeonSelectedLeft.Room;
                    var encontrado = 0;
                    for (let l = 0; l < RoomVisited.length; l++) {
                        if (RoomVisited[l].Room.Id == (puertaColocada)) {
                            encontrado = 1;
                            puertaColocada = 0;
                        }
                    }
                    if (encontrado == 0) {
                        cuartoCumplido = 1;
                        DungeonBlockSelected.ConnectLeft = DungeonSelectedLeft;
                        DungeonBlockSelected.WallLeft = 0;
                        DungeonSelectedLeft.ConnectRight = DungeonBlockSelected;
                        DungeonSelectedLeft.WallRight = 0;
                        RoomVisited[RoomVisited.length] =
                            {
                                Room: DungeonRooms[puertaColocada - 1],
                                RoomAnterior: RoomVisitedActual
                            };
                    }
                }
            }

            if (DungeonBlockSelected.X < (GameDungeon.DungeonWidth - 1) && puertaColocada == 0) {
                var DungeonSelectedRight = DungeonArray[DungeonBlockSelected.Y][DungeonBlockSelected.X + 1];
                if (DungeonSelectedRight.Id > 0 && DungeonSelectedRight.Room != DungeonRoomSelected.Id) {
                    puertaColocada = DungeonSelectedRight.Room;
                    var encontrado = 0;
                    for (let l = 0; l < RoomVisited.length; l++) {
                        if (RoomVisited[l].Room.Id == (puertaColocada)) {
                            encontrado = 1;
                            puertaColocada = 0;
                        }
                    }
                    if (encontrado == 0) {
                        cuartoCumplido = 1;
                        DungeonBlockSelected.ConnectRight = DungeonSelectedRight;
                        DungeonBlockSelected.WallRight = 0;
                        DungeonSelectedRight.ConnectLeft = DungeonBlockSelected;
                        DungeonSelectedRight.WallLeft = 0;
                        RoomVisited[RoomVisited.length] =
                            {
                                Room: DungeonRooms[puertaColocada - 1],
                                RoomAnterior: RoomVisitedActual
                            };
                    }
                }
            }

            if (DungeonBlockSelected.Y > 0 && puertaColocada == 0) {
                var DungeonSelectedTop = DungeonArray[DungeonBlockSelected.Y - 1][DungeonBlockSelected.X];
                if (DungeonSelectedTop.Id > 0 && DungeonSelectedTop.Room != DungeonRoomSelected.Id) {
                    puertaColocada = DungeonSelectedTop.Room;
                    var encontrado = 0;
                    for (let l = 0; l < RoomVisited.length; l++) {
                        if (RoomVisited[l].Room.Id == (puertaColocada)) {
                            encontrado = 1;
                            puertaColocada = 0;
                        }
                    }
                    if (encontrado == 0) {
                        cuartoCumplido = 1;
                        DungeonBlockSelected.ConnectTop = DungeonSelectedTop;
                        DungeonBlockSelected.WallTop = 0;
                        DungeonSelectedTop.ConnectBottom = DungeonBlockSelected;
                        DungeonSelectedTop.WallBottom = 0;
                        RoomVisited[RoomVisited.length] =
                            {
                                Room: DungeonRooms[puertaColocada - 1],
                                RoomAnterior: RoomVisitedActual
                            };
                    }
                }
            }

            if (DungeonBlockSelected.Y < (GameDungeon.DungeonHeight - 1) && puertaColocada == 0) {
                var DungeonSelectedBottom = DungeonArray[DungeonBlockSelected.Y + 1][DungeonBlockSelected.X];
                if (DungeonSelectedBottom.Id > 0 && DungeonSelectedBottom.Room != DungeonRoomSelected.Id) {
                    puertaColocada = DungeonSelectedBottom.Room;
                    var encontrado = 0;
                    for (let l = 0; l < RoomVisited.length; l++) {
                        if (RoomVisited[l].Room.Id == (puertaColocada)) {
                            encontrado = 1;
                            puertaColocada = 0;
                        }
                    }
                    if (encontrado == 0) {
                        cuartoCumplido = 1;
                        DungeonBlockSelected.ConnectBottom = DungeonSelectedBottom;
                        DungeonBlockSelected.WallBottom = 0;
                        DungeonSelectedBottom.ConnectTop = DungeonBlockSelected;
                        DungeonSelectedBottom.WallTop = 0;
                        RoomVisited[RoomVisited.length] =
                            {
                                Room: DungeonRooms[puertaColocada - 1],
                                RoomAnterior: RoomVisitedActual
                            };
                    }
                }
            }
        }
        RoomVisitedActual = (cuartoCumplido != 0) ? RoomVisited[RoomVisited.length - 1] : RoomVisitedActual.RoomAnterior;
    }
    return GameDungeon;
}

function MakeDungeonRoomInner(GameDungeon) {
    var DungeonArray = GameDungeon.DungeonBlocks;
    var DungeonRooms = GameDungeon.DungeonRooms;

    for (let l = 0; l < GameDungeon.DungeonHeight; l++) {
        for (let m = 0; m < GameDungeon.DungeonWidth; m++) {
            if (DungeonArray[l][m].Id > 0) {
                DungeonArray[l][m].RoomWallLeft = DungeonArray[l][m].ConnectLeft == 0 ? 1 : DungeonArray[l][m].WallLeft;
                DungeonArray[l][m].RoomWallRight = DungeonArray[l][m].ConnectRight == 0 ? 1 : DungeonArray[l][m].WallRight;
                DungeonArray[l][m].RoomWallBottom = DungeonArray[l][m].ConnectBottom == 0 ? 1 : DungeonArray[l][m].WallBottom;
                DungeonArray[l][m].RoomWallTop = DungeonArray[l][m].ConnectTop == 0 ? 1 : DungeonArray[l][m].WallTop;
                DungeonArray[l][m].Status = "NOT";
            }
        }
    }

    for (let r = 0; r < DungeonRooms.length; r++) {
        var RoomsWithConnect = [];
        var cont = 0;
        if (DungeonRooms[r].Blocks.length == 1 || DungeonRooms[r].Blocks[0].length == 1) {
            for (let b = 0; b < DungeonRooms[r].Blocks.length; b++) {
                for (let a = 0; a < DungeonRooms[r].Blocks[b].length; a++) {
                    var bloqueact = DungeonRooms[r].Blocks[b][a].Block;
                    if (bloqueact.Id > 0) {
                        bloqueact.Status = "OK";
                        bloqueact.RoomWallLeft = bloqueact.ConnectLeft == 0 ? 0 : bloqueact.WallLeft;
                        bloqueact.RoomWallRight = bloqueact.ConnectRight == 0 ? 0 : bloqueact.WallRight;
                        bloqueact.RoomWallBottom = bloqueact.ConnectBottom == 0 ? 0 : bloqueact.WallBottom;
                        bloqueact.RoomWallTop = bloqueact.ConnectTop == 0 ? 0 : bloqueact.WallTop;
                    }
                }
            }
        }
        else {
            for (let b = 0; b < DungeonRooms[r].Blocks.length; b++) {
                for (let a = 0; a < DungeonRooms[r].Blocks[b].length; a++) {
                    if (DungeonRooms[r].Blocks[b][a].Block.Id > 0) {
                        RoomsWithConnect[cont] = DungeonRooms[r].Blocks[b][a].Block;
                        cont++;
                    }
                }
            }
            if (RoomsWithConnect.length > 1) {
                var BloquesLiberados = [];
                var bloquesCompletados = 0;

                var BlockCursor = RoomsWithConnect[0];
                BlockCursor.Status = "OK";
                BloquesLiberados[BloquesLiberados.length] = BlockCursor;

                while (bloquesCompletados < RoomsWithConnect.length) {
                    bloquesCompletados = 0;
                    var bloqueColocado = 0;
                    var retroceso = 0;
                    while (bloqueColocado == 0) {
                        var BloquesDisponibles = [];
                        var DireccionesDisponibles = [];

                        if (DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX - 1] != null &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX - 1].Block.Status != "OK" &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX - 1].Block.Id > 0) {
                            BloquesDisponibles[BloquesDisponibles.length] = DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX - 1].Block;
                            DireccionesDisponibles[DireccionesDisponibles.length] = "LEFT";
                        }

                        if (DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX + 1] != null &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX + 1].Block.Status != "OK" &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX + 1].Block.Id > 0) {
                            BloquesDisponibles[BloquesDisponibles.length] = DungeonRooms[r].Blocks[BlockCursor.RoomY][BlockCursor.RoomX + 1].Block;
                            DireccionesDisponibles[DireccionesDisponibles.length] = "RIGHT";
                        }

                        if (DungeonRooms[r].Blocks[BlockCursor.RoomY - 1] != null && DungeonRooms[r].Blocks[BlockCursor.RoomY - 1][BlockCursor.RoomX] != null &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY - 1][BlockCursor.RoomX].Block.Status != "OK" &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY - 1][BlockCursor.RoomX].Block.Id > 0) {
                            BloquesDisponibles[BloquesDisponibles.length] = DungeonRooms[r].Blocks[BlockCursor.RoomY - 1][BlockCursor.RoomX].Block;
                            DireccionesDisponibles[DireccionesDisponibles.length] = "TOP";
                        }

                        if (DungeonRooms[r].Blocks[BlockCursor.RoomY + 1] != null && DungeonRooms[r].Blocks[BlockCursor.RoomY + 1][BlockCursor.RoomX] != null &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY + 1][BlockCursor.RoomX].Block.Status != "OK" &&
                            DungeonRooms[r].Blocks[BlockCursor.RoomY + 1][BlockCursor.RoomX].Block.Id > 0) {
                            BloquesDisponibles[BloquesDisponibles.length] = DungeonRooms[r].Blocks[BlockCursor.RoomY + 1][BlockCursor.RoomX].Block;
                            DireccionesDisponibles[DireccionesDisponibles.length] = "BOTTOM";
                        }

                        if (BloquesDisponibles.length > 0) {
                            var numseleccionado = Math.floor((Math.random() * BloquesDisponibles.length));
                            var nuevoBloque = BloquesDisponibles[numseleccionado];
                            switch (DireccionesDisponibles[numseleccionado]) {
                                case "LEFT": BlockCursor.RoomWallLeft = 0; nuevoBloque.RoomWallRight = 0; break;
                                case "RIGHT": BlockCursor.RoomWallRight = 0; nuevoBloque.RoomWallLeft = 0; break;
                                case 'TOP': BlockCursor.RoomWallTop = 0; nuevoBloque.RoomWallBottom = 0; break;
                                case "BOTTOM": BlockCursor.RoomWallBottom = 0; nuevoBloque.RoomWallTop = 0; break;
                            }
                            BlockCursor = nuevoBloque;
                            BlockCursor.Status = "OK";
                            BloquesLiberados[BloquesLiberados.length] = BlockCursor;
                            bloqueColocado = 1;
                        } else {
                            retroceso++;
                            BlockCursor = BloquesLiberados[BloquesLiberados.length - retroceso];
                        }
                    }
                    for (let b = 0; b < DungeonRooms[r].Blocks.length; b++) {
                        for (let a = 0; a < DungeonRooms[r].Blocks[b].length; a++) {
                            if (DungeonRooms[r].Blocks[b][a].Block.Status == "OK") {
                                for (let c = 0; c < RoomsWithConnect.length; c++) {
                                    if (DungeonRooms[r].Blocks[b][a].Block.Id == RoomsWithConnect[c].Id) {
                                        bloquesCompletados++;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                var BlockCursor = RoomsWithConnect[0];
                BlockCursor.Status = "OK";
                if (DungeonRooms[r].Blocks.length > 1 || DungeonRooms[r].Blocks[0].length > 1) {
                    for (let b = 0; b < DungeonRooms[r].Blocks.length; b++) {
                        for (let a = 0; a < DungeonRooms[r].Blocks[b].length; a++) {
                            var bloqueact = DungeonRooms[r].Blocks[b][a].Block;
                            if (bloqueact.Id > 0) {
                                bloqueact.Status = "OK";
                                bloqueact.RoomWallLeft = bloqueact.ConnectLeft == 0 ? 0 : bloqueact.WallLeft;
                                bloqueact.RoomWallRight = bloqueact.ConnectRight == 0 ? 0 : bloqueact.WallRight;
                                bloqueact.RoomWallBottom = bloqueact.ConnectBottom == 0 ? 0 : bloqueact.WallBottom;
                                bloqueact.RoomWallTop = bloqueact.ConnectTop == 0 ? 0 : bloqueact.WallTop;
                            }
                        }
                    }
                }
            }
        }
    }
    return GameDungeon;
}
function GraphiqueDungeon(GameDungeon) {
    var DungeonArray = GameDungeon.DungeonBlocks;
    var DungeonRooms = GameDungeon.DungeonRooms;

    var minimap = "";
    minimap += "<table style = 'text-align: center;border-spacing:0px;' >\n";
    for (let l = 0; l < GameDungeon.DungeonHeight; l++) {
        minimap += "<tr>\n";
        for (let m = 0; m < GameDungeon.DungeonWidth; m++) {
            var RndmColorBackground = "#FFD700";
            var border = "border-style:solid;border-width:0px;";
            var backgroundcolor = "background-color:" + (DungeonArray[l][m].Id > 0 ? (DungeonArray[l][m].Status == "OK") ? RndmColorBackground : "#000" : "#FFF") + ";";
            if (DungeonArray[l][m].Id > 0) {
                if (DungeonArray[l][m].WallTop > 0 || DungeonArray[l][m].RoomWallTop > 0) {
                    border += "border-top: solid " + (l > 0 && DungeonArray[l - 1][m] != null && DungeonArray[l - 1][m].Id == 0 ? "2" : (DungeonArray[l - 1] == null) ? "2" : "1") + "px;";
                }
                if (DungeonArray[l][m].WallRight > 0 || DungeonArray[l][m].RoomWallRight > 0) {
                    border += "border-right: solid " + ((m <= GameDungeon.DungeonWidth - 1) && DungeonArray[l][m + 1] != null && DungeonArray[l][m + 1].Id == 0 ? "2" : DungeonArray[l][m + 1] == null ? "2" : "1") + "px;";
                }
                if (DungeonArray[l][m].WallBottom > 0 || DungeonArray[l][m].RoomWallBottom > 0) {
                    border += "border-bottom: solid " + ((l < GameDungeon.DungeonHeight - 1) && DungeonArray[l + 1][m] != null && DungeonArray[l + 1][m].Id == 0 ? "2" : (DungeonArray[l + 1] == null) ? "2" : "1") + "px;"
                }
                if (DungeonArray[l][m].WallLeft > 0 || DungeonArray[l][m].RoomWallLeft > 0) {
                    border += "border-left: solid " + (m >= 0 && DungeonArray[l][m - 1] != null && DungeonArray[l][m - 1].Id == 0 ? "2" : DungeonArray[l][m - 1] == null ? "2" : "1") + "px;";
                }
                minimap += "<td style='width:15px;height:15px;font-size: 10px;padding: 0px;" + backgroundcolor + border + "'>";
            } else {
                border = "border-style:solid;border-width:1px;border-color:#EEE";
                minimap += "<td style='width:15px;height:15px;font-size: 10px;" + backgroundcolor + border + "'>";
            }

            if (DungeonArray[l][m].Id > 0) {
                for (let r = 0; r < DungeonRooms.length; r++) {
                    for (let b = 0; b < DungeonRooms[r].Blocks.length; b++) {
                        for (let a = 0; a < DungeonRooms[r].Blocks[b].length; a++) {
                            if (DungeonArray[l][m].Id == DungeonRooms[r].Blocks[b][a].Block.Id) {
                                minimap += "<div Style='width:100%; height:100%'> </div>";
                                // minimap += "<div>"+  ((a == 0 && b == 0) ? DungeonRooms[r].Id: "-") +"</div>";
                                // minimap += "<div onclick = 'console.log("+DungeonArray[l][m].Id+")'>"+  ((DungeonRooms[r].Blocks[b][a].Block.Status == "OK") ? "-": "") +"</div>";
                            }
                        }
                    }
                }
            }
            else {
                minimap += '<div style=\'\'> &nbsp </div>';
            }
            minimap += '</td>\n';
        }
        minimap += '</tr>\n';
    }
    minimap += '</table>';

    document.body.innerHTML = '<button type="button" onclick="GraphiqueDungeon(makeDungeon(DefaultDungeonConfiguration()));">CREATE</button>';
    document.body.innerHTML += minimap;
}
