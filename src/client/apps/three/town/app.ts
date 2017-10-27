
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/gmoyer/pen/LyMmQJ

import * as THREE from '../three';
import * as $ from 'jquery';

const prairieImg = require('./grass_texture223.jpg') as string;
function rad(i) {
    return i * Math.PI / 180;
}

let seed = 0;
function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function randint(min, max) {
    return Math.floor(random() * max) + min;
}
function rotateAround(point, center, angle) {
    angle = (angle) * (Math.PI / 180); // Convert to radians
    const rotatedX = Math.cos(angle) * (point.x - center.x) -
        Math.sin(angle) * (point.y - center.y) +
        center.x;
    const rotatedY = Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y;
    return { x: rotatedX, y: rotatedY };
}

class PrismGeometry extends THREE.ExtrudeGeometry {
    constructor(vertices, height) {
        const shape = new THREE.Shape();
        (function f(ctx) {

            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);

        })(shape);
        const settings = {
            amount: height,
            bevelEnabled: false,
        };
        super(shape, settings);
    }
}

let texture = THREE.ImageUtils.loadTexture(prairieImg, null, function () {
    $.getJSON('https://cpv2api.com/profile/gmoyer', function (resp) {
        if (!resp.success) return;
        let followers = resp.data.followers;
        let houseleft = followers;
        console.log(followers);
        let scene = new THREE.Scene();
        scene.background = new THREE.Color('#87ceeb');
        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        // renderer.shadowMapSoft = true;
        document.body.appendChild(renderer.domElement);

        let oControls = new THREE.OrbitControls(camera, renderer.domElement);
        // addNote()
        const light = new THREE.DirectionalLight(0xffffff, 1); // 2.5
        light.position.set(50, 100, -50);
        light.position.multiplyScalar(1.3); // 1.3

        light.castShadow = true;
        // const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
        // light.shadowCameraVisible = true;
        // scene.add(cameraHelper);

        light.shadowMapWidth = 3500;
        light.shadowMapHeight = 3500;

        let d = 500;

        light.shadowCameraLeft = -d;
        light.shadowCameraRight = d;
        light.shadowCameraTop = d;
        light.shadowCameraBottom = -d;

        light.shadowCameraFar = 10000;
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        let text2 = document.createElement('div');
        text2.style.position = 'absolute';
        text2.id = 'followme';
        // text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        text2.style.width = '100px';
        text2.style.height = '100px';
        text2.style.color = 'white';
        text2.innerHTML = 'Click here to follow me and </br>become part of this pen!';
        text2.style.top = 10 + 'px';
        text2.style.left = 10 + 'px';
        document.body.appendChild(text2);

        let text3 = document.createElement('div');
        text3.id = 'info';
        // text3.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        // text3.innerHTML = "Each house is a follower!";
        document.body.appendChild(text3);

        $('#followme').click(function () {
            window.open('https://codepen.io/gmoyer/post/followtown', '_blank');
        });



        // Create elements here:
        let streetcount = Math.ceil(followers / 10);
        let rows = Math.sqrt(streetcount);

        let rowrem = Math.abs(Math.ceil(rows - 1) - rows);
        console.log(rows);
        console.log(rowrem);
        let rowsX = rows;
        let rowsZ = rows;
        if (rowrem < 0.5) {
            rowsX -= 1;
        }
        let centerX = ((rowsX / 2) * 70);
        let centerZ = ((rowsZ / 2) * 47);
        function newLog(x, y, z, rotation) {
            let geometry = new THREE.BoxGeometry(5, 0.5, 0.5);
            let material = new THREE.MeshPhongMaterial({ color: 'brown' });
            let log = new THREE.Mesh(geometry, material);
            log.position.x = x;
            log.position.z = z;
            log.position.y = y;
            scene.add(log);
            log.rotation.y = rad(rotation + 90);
        }
        function newWindow(x, y, z, rotation) {
            let geometry = new THREE.BoxGeometry(1, 0.6, 0.1);
            let material = new THREE.MeshPhongMaterial({ color: 'skyblue' });
            let window = new THREE.Mesh(geometry, material);
            for (let i = -0.3; i <= 0.3; i += 0.3) {
                let geometry = new THREE.BoxGeometry(1, 0.05, 0.2);
                let material = new THREE.MeshPhongMaterial({ color: 'black' });
                let frame = new THREE.Mesh(geometry, material);
                frame.position.y = i;
                window.add(frame);
            }
            for (let i = -0.5; i <= 0.5; i += 0.5) {
                let geometry = new THREE.BoxGeometry(0.05, 0.6, 0.2);
                let material = new THREE.MeshPhongMaterial({ color: 'black' });
                let frame = new THREE.Mesh(geometry, material);
                frame.position.x = i;
                window.add(frame);
            }
            window.position.x = x;
            window.position.z = z;
            window.position.y = y;
            window.rotation.y = rad(rotation);
            return window;
        }
        function newTree(x, z) {
            let height = randint(20, 50) / 10;
            let geometry1 = new THREE.CylinderGeometry(0.5, 0.5, height, 4);
            let material1 = new THREE.MeshPhongMaterial({ color: 'brown' });
            let tree = new THREE.Mesh(geometry1, material1);

            let geometry2 = new THREE.SphereGeometry(height / 2, 4, 4);
            let material2 = new THREE.MeshPhongMaterial({ color: 'lime' });
            let leaves = new THREE.Mesh(geometry2, material2);
            leaves.position.y = height / 2;
            leaves.castShadow = true;
            tree.add(leaves);
            tree.position.x = x;
            tree.position.y = height / 2;
            tree.position.z = z;
            return tree;
        }
        function newBush(x, z) {
            let size = randint(10, 10) / 10;

            let geometry = new THREE.SphereGeometry(size, 4, 4);
            let material = new THREE.MeshPhongMaterial({ color: 'lime' });
            let bush = new THREE.Mesh(geometry, material);
            bush.castShadow = true;
            bush.position.x = x;
            bush.position.z = z;
            return bush;
        }
        let thars = [];
        function newCar(x, z) {
            let colors = ['white', 'green', 'lime', 'brown', 'blue', 'skyblue', 'yellow'];
            let points = [];

            points.push(new THREE.Vector2(1.5, 0));
            points.push(new THREE.Vector2(-2, 0));

            if (random() <= 0.5) {
                points.push(new THREE.Vector2(-2, 0.75));
                points.push(new THREE.Vector2(-1, 0.75));

                points.push(new THREE.Vector2(-0.5, 1.3));
                points.push(new THREE.Vector2(1.5, 1.3));
            } else {
                points.push(new THREE.Vector2(-2, 0.75));
                points.push(new THREE.Vector2(-1.5, 0.75));

                points.push(new THREE.Vector2(-1, 1.3));
                points.push(new THREE.Vector2(0, 1.3));
                points.push(new THREE.Vector2(0, 0.75));
                points.push(new THREE.Vector2(1.5, 0.75));
            }
            let height = 1.5;
            let geometry1 = new PrismGeometry(points, height);
            let material1 = new THREE.MeshPhongMaterial({ color: colors[randint(0, colors.length)] });
            let car = new THREE.Mesh(geometry1, material1);


            let geometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            let material2 = new THREE.MeshPhongMaterial({ color: 'black' });


            for (let ix = -1; ix <= 1; ix += 2) {
                for (let iz = 0; iz <= 1.5; iz += 1.5) {
                    let wheel = new THREE.Mesh(geometry2, material2);
                    wheel.position.x = ix;
                    wheel.position.z = iz;
                    car.add(wheel);
                }
            }

            car.position.x = x;
            car.position.z = z;
            car.position.y = -0.25;
            car.rotation.y = rad(randint(-10, 20));
            // car.rotation.y = rad(90)
            thars.push(car);
            return car;
        }
        let thouses = [];
        function newHouse(x, z, rotation) {
            if (houseleft > 0) {
                let points = [];
                points.push(new THREE.Vector2(3, 0));
                points.push(new THREE.Vector2(-3, 0));
                points.push(new THREE.Vector2(-3, randint(30, 25) / 10));
                points.push(new THREE.Vector2(0, randint(55, 20) / 10));
                points.push(new THREE.Vector2(3, randint(30, 25) / 10));
                let height = 5;
                let geometry: THREE.Geometry = new PrismGeometry(points, height);
                let colors = ['brown', 'skyblue', 'yellow', 'blue', 'gray'];
                let material = new THREE.MeshPhongMaterial({ color: colors[randint(0, colors.length)] });
                let house = new THREE.Mesh(geometry, material);
                let house2 = new THREE.Mesh(geometry, material);
                house2.rotation.y = rad(90);
                house2.position.z = 3;
                house2.castShadow = true;
                house.add(house2);
                geometry = new THREE.BoxGeometry(0.7, 1.1, 0.3);
                material = new THREE.MeshPhongMaterial({ color: 'brown' });
                let door = new THREE.Mesh(geometry, material);
                house.add(door);
                door.position.x = -0.5;
                door.position.y = 1.1;
                geometry = new THREE.BoxGeometry(0.8, 1.2, 0.25);
                material = new THREE.MeshPhongMaterial({ color: 'black' });
                let doorframe = new THREE.Mesh(geometry, material);
                house.add(doorframe);
                doorframe.position.x = -0.5;
                doorframe.position.y = 1.1;
                geometry = new THREE.BoxGeometry(0.12, 0.12, 0.35);
                let doorknob = new THREE.Mesh(geometry, material);
                doorknob.position.y = 1.2;
                doorknob.position.x = -0.7;
                house.add(doorknob);
                geometry = new THREE.BoxGeometry(2, 1, 1);
                material = new THREE.MeshPhongMaterial({ color: 'gray' });
                let doorstep = new THREE.Mesh(geometry, material);
                doorstep.receiveShadow = true;
                house.add(doorstep);
                doorstep.position.x = -0.5;
                geometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
                material = new THREE.MeshPhongMaterial({ color: 'gray' });
                doorstep = new THREE.Mesh(geometry, material);
                doorstep.receiveShadow = true;
                house.add(doorstep);
                doorstep.position.x = -0.5;
                geometry = new THREE.BoxGeometry(3.2, 5, 0.3);
                material = new THREE.MeshPhongMaterial({ color: 'white' });
                let garage = new THREE.Mesh(geometry, material);
                house.add(garage);
                garage.position.x = 2.7;
                garage.position.y = 0;
                geometry = new THREE.BoxGeometry(3.4, 0.5, 6);
                material = new THREE.MeshPhongMaterial({ color: 'gray' });
                let driveway = new THREE.Mesh(geometry, material);
                driveway.receiveShadow = true;
                driveway.position.x = 2.7;
                driveway.position.z = -2;
                driveway.rotation.x = rad(-4);
                house.add(driveway);
                geometry = new THREE.BoxGeometry(1.5, 0.1, 6);
                material = new THREE.MeshPhongMaterial({ color: '#cccccc' });
                let walkway = new THREE.Mesh(geometry, material);
                walkway.receiveShadow = true;
                walkway.position.x = -0.5;
                walkway.position.z = -2;
                walkway.rotation.x = rad(-0.6);
                house.add(walkway);

                geometry = new THREE.BoxGeometry(0.7, 1.1, 0.3);
                material = new THREE.MeshPhongMaterial({ color: 'brown' });
                door = new THREE.Mesh(geometry, material);
                house.add(door);
                door.position.x = -1;
                door.position.y = 0.7;
                door.position.z = 5;
                geometry = new THREE.BoxGeometry(0.8, 1.2, 0.25);
                material = new THREE.MeshPhongMaterial({ color: 'black' });
                doorframe = new THREE.Mesh(geometry, material);
                house.add(doorframe);
                doorframe.position.x = -1;
                doorframe.position.y = 0.7;
                doorframe.position.z = 5;
                geometry = new THREE.BoxGeometry(0.12, 0.12, 0.35);
                doorknob = new THREE.Mesh(geometry, material);
                doorknob.position.y = 0.8;
                doorknob.position.x = -0.8;
                doorknob.position.z = 5;
                house.add(doorknob);

                if (random() <= 0.5) {
                    house.add(newCar(-randint(30, 20) / 10, -8));
                }


                house.add(newWindow(-2, 1.5, 0, 0));

                for (let i = 0; i < randint(1, 2); i++) {
                    house.add(newTree(randint(-20, 40) / 10, randint(60, 20) / 10));
                }
                for (let i = 0; i < randint(1, 2); i++) {
                    house.add(newBush(randint(-40, 20) / 10, randint(-50, 20) / 10));
                }

                scene.add(house);
                house.castShadow = true;
                house.position.x = x;
                house.position.y = 0.5;
                house.position.z = z;
                house.rotation.y = rad(rotation);
                thouses.push(house);
                houseleft -= 1;
            } else {
                let geometry = new THREE.BoxGeometry(7, 1.5, 10);
                let material = new THREE.MeshPhongMaterial({ color: 'gray' });
                let plot = new THREE.Mesh(geometry, material);
                scene.add(plot);
                if (rotation === 0) {
                    plot.position.x = x + 1;
                    plot.position.z = z + 3;
                    let xoff = x + randint(-25, 50) / 10;
                    let zoff = z + randint(0, 50) / 10;
                    let rotation = randint(-20, 40);
                    newLog(xoff, 1, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff + 0.7, 1, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff - 0.7, 1, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff + 0.35, 1.5, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff - 0.35, 1.5, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff, 2, zoff + randint(-2, 4) / 10, rotation);
                } else {
                    plot.position.x = x - 1;
                    plot.position.z = z - 3;
                    let xoff = x + randint(-25, 50) / 10;
                    let zoff = z - randint(0, 50) / 10;
                    let rotation = randint(-20, 40);
                    newLog(xoff, 1, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff + 0.7, 1, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff - 0.7, 1, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff + 0.35, 1.5, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff - 0.35, 1.5, zoff + randint(-2, 4) / 10, rotation);
                    newLog(xoff, 2, zoff + randint(-2, 4) / 10, rotation);
                }

            }
        }
        function newFence(x, z, length, interval, rotation) {
            length /= interval;
            length = Math.round(length);
            length *= interval;
            let geometry = new THREE.BoxGeometry(length, 0.3, 0.3);
            let material = new THREE.MeshPhongMaterial({ color: 'tan' });
            let fence = new THREE.Mesh(geometry, material);
            fence.receiveShadow = true;
            for (let i = 0; i <= length; i += interval) {
                let geometry = new THREE.BoxGeometry(0.3, 2, 0.3);
                let material = new THREE.MeshPhongMaterial({ color: 'tan' });
                let fencepost = new THREE.Mesh(geometry, material);
                fencepost.receiveShadow = true;

                fence.add(fencepost);
                fencepost.position.x = (length / 2) - i;
                fencepost.position.y = -0.5;
            }
            scene.add(fence);
            fence.position.x = x;
            fence.position.y = 1;
            fence.position.z = z;
            fence.rotation.y = rad(rotation);
            fence.castShadow = true;
        }
        function newStreet(xpos, zpos) {
            let geometry = new THREE.PlaneGeometry(70, 47, 1, 1);
            let material = new THREE.MeshPhongMaterial({ color: 'gray' });

            let street = new THREE.Mesh(geometry, material);
            scene.add(street);
            street.rotation.x = -rad(90);
            street.position.x = xpos;
            street.position.z = zpos;




            geometry = new THREE.PlaneGeometry(53, 30, 1, 1);
            material = new THREE.MeshPhongMaterial({ map: texture });

            let yard = new THREE.Mesh(geometry, material);
            yard.receiveShadow = true;
            yard.rotation.x = -rad(90);
            yard.position.x = xpos;
            yard.position.z = zpos;
            yard.position.y = 0.5;
            scene.add(yard);
            geometry = new THREE.BoxGeometry(53, 1, 1);
            material = new THREE.MeshPhongMaterial({ color: '#cccccc' });
            let sidewalk = new THREE.Mesh(geometry, material);
            sidewalk.receiveShadow = true;
            scene.add(sidewalk);
            sidewalk.position.z = zpos - 15.5;
            sidewalk.position.x = xpos;

            sidewalk = new THREE.Mesh(geometry, material);
            sidewalk.receiveShadow = true;
            scene.add(sidewalk);
            sidewalk.position.z = zpos + 15.5;
            sidewalk.position.x = xpos;

            geometry = new THREE.BoxGeometry(1, 1, 32);
            sidewalk = new THREE.Mesh(geometry, material);
            sidewalk.receiveShadow = true;
            scene.add(sidewalk);
            sidewalk.position.z = zpos;
            sidewalk.position.x = xpos - 27;

            sidewalk = new THREE.Mesh(geometry, material);
            sidewalk.receiveShadow = true;
            scene.add(sidewalk);
            sidewalk.position.z = zpos;
            sidewalk.position.x = xpos + 27;

            newFence(xpos, zpos, 50, 4, 0);

            for (let x = 0; x < 5; x++) {
                for (let z = 0; z < 2; z++) {
                    if (z === 0) {
                        newHouse(xpos + ((x - 2) * 10), -10 + zpos, 0);
                        newFence(-4 + xpos + ((x - 2) * 10), -4.5 + zpos, 10, 3, 90);
                    } else {
                        newHouse(xpos + ((x - 2) * 10), 10 + zpos, 180);
                        newFence(4 + xpos + ((x - 2) * 10), 4.5 + zpos, 10, 3, 90);
                    }
                }
            }
        }

        for (let x = 0; x < rowsX; x++) {
            for (let z = 0; z < rowsZ; z++) {
                newStreet(x * 70, z * 47);
            }
        }


        // end of elements
        oControls.maxPolarAngle = Math.PI * 0.475;
        oControls.target.set(centerX, 0, centerZ);
        camera.position.y = 50;
        camera.position.x = centerX + 100;
        camera.position.z = centerZ + 50;
        let lookAt = new THREE.Vector3(centerX, 0, centerZ);
        camera.lookAt(lookAt);
        let render = function () {
            requestAnimationFrame(render);
            mainloop();
            renderer.render(scene, camera);
        };
        function mainloop() {
        }
        render();


        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        }
    });
});

